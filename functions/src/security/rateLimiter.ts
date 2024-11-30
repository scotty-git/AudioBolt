import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

const db = getFirestore();

interface RateLimitConfig {
  operation: string;
  maxRequests: number;
  windowSeconds: number;
  scope: 'user' | 'ip' | 'both';
}

const RATE_LIMITS: RateLimitConfig[] = [
  {
    operation: 'create_submission',
    maxRequests: 60,
    windowSeconds: 3600, // 1 hour
    scope: 'user'
  },
  {
    operation: 'update_submission',
    maxRequests: 120,
    windowSeconds: 3600,
    scope: 'user'
  },
  {
    operation: 'query_submissions',
    maxRequests: 600,
    windowSeconds: 3600,
    scope: 'user'
  },
  {
    operation: 'bulk_operation',
    maxRequests: 10,
    windowSeconds: 3600,
    scope: 'both'
  }
];

export class RateLimiter {
  private static getKey(userId: string, ip: string, operation: string, scope: 'user' | 'ip' | 'both'): string {
    switch (scope) {
      case 'user':
        return `${operation}:user:${userId}`;
      case 'ip':
        return `${operation}:ip:${ip}`;
      case 'both':
        return `${operation}:${userId}:${ip}`;
    }
  }

  private static async getRateLimitDoc(key: string) {
    return db.collection('rate_limits').doc(key);
  }

  static async checkRateLimit(
    userId: string,
    ip: string,
    operation: string
  ): Promise<boolean> {
    const config = RATE_LIMITS.find(l => l.operation === operation);
    if (!config) return true;

    const key = this.getKey(userId, ip, operation, config.scope);
    const doc = await this.getRateLimitDoc(key);

    try {
      let allowed = false;

      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(doc);
        const now = Date.now();
        const windowStart = now - (config.windowSeconds * 1000);

        if (!snapshot.exists) {
          transaction.set(doc, {
            requests: [{
              timestamp: now,
              ip: ip
            }],
            firstRequest: now,
            lastRequest: now
          });
          allowed = true;
          return;
        }

        const data = snapshot.data()!;
        
        // Clean up old requests
        const validRequests = data.requests.filter((r: any) => 
          r.timestamp > windowStart
        );

        // Check for suspicious patterns
        const ipCounts = validRequests.reduce((acc: Record<string, number>, r: any) => {
          acc[r.ip] = (acc[r.ip] || 0) + 1;
          return acc;
        }, {});

        // Detect potential IP spoofing
        const suspiciousIPs = Object.entries(ipCounts)
          .filter(([_, count]) => count > config.maxRequests * 0.8)
          .map(([ip]) => ip);

        if (suspiciousIPs.length > 0) {
          await this.reportSuspiciousActivity(userId, operation, suspiciousIPs);
          allowed = false;
          return;
        }

        if (validRequests.length >= config.maxRequests) {
          allowed = false;
          return;
        }

        validRequests.push({
          timestamp: now,
          ip: ip
        });

        transaction.set(doc, {
          requests: validRequests,
          firstRequest: validRequests[0].timestamp,
          lastRequest: now
        });

        allowed = true;
      });

      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail closed on errors
      return false;
    }
  }

  private static async reportSuspiciousActivity(
    userId: string,
    operation: string,
    suspiciousIPs: string[]
  ) {
    await db.collection('security_alerts').add({
      type: 'suspicious_rate_limit',
      userId,
      operation,
      suspiciousIPs,
      timestamp: FieldValue.serverTimestamp(),
      metadata: {
        description: 'Potential IP spoofing detected',
        severity: 'high'
      }
    });
  }

  static async cleanup() {
    const now = Date.now();
    const batch = db.batch();
    let count = 0;

    const snapshot = await db.collection('rate_limits').get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const maxWindow = Math.max(...RATE_LIMITS.map(l => l.windowSeconds)) * 1000;
      
      if (now - data.lastRequest > maxWindow) {
        batch.delete(doc.ref);
        count++;
      }

      if (count >= 500) {
        await batch.commit();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  }
}
