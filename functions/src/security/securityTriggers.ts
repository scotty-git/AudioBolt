import * as functions from 'firebase-functions';
import { SecurityMonitor } from './securityMonitor';
import { RateLimiter } from './rateLimiter';

// Monitor unauthorized access attempts
export const monitorUnauthorizedAccess = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    if (!context.auth) {
      await SecurityMonitor.logSecurityAlert({
        type: 'unauthorized_access',
        severity: 'medium',
        description: 'Unauthorized write attempt',
        metadata: {
          collection: context.params.collection,
          docId: context.params.docId,
          operation: change.after.exists ? 
            (change.before.exists ? 'update' : 'create') : 
            'delete'
        }
      });
    }
  });

// Monitor rule bypass attempts
export const monitorRuleBypass = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return; // Skip deletes

    const data = change.after.data();
    const suspiciousPatterns = [
      // Timestamp tampering
      data.createdAt > data.updatedAt,
      // Nested timestamp modification
      JSON.stringify(data).includes('"createdAt"'),
      // Field deletion attempt
      Object.values(data).includes(null) && !change.before.exists,
      // Invalid status transitions
      data.status === 'archived' && change.before.exists && 
        change.before.data()?.status === 'completed'
    ];

    if (suspiciousPatterns.some(Boolean)) {
      await SecurityMonitor.logSecurityAlert({
        type: 'rule_bypass_attempt',
        severity: 'high',
        userId: context.auth?.uid,
        description: 'Potential security rule bypass attempt detected',
        metadata: {
          collection: context.params.collection,
          docId: context.params.docId,
          suspiciousData: data
        }
      });
    }
  });

// Monitor rate limit violations
export const monitorRateLimits = functions.firestore
  .document('rate_limit_violations/{violationId}')
  .onCreate(async (snap, context) => {
    const violation = snap.data();
    
    await SecurityMonitor.logSecurityAlert({
      type: 'suspicious_rate_limit',
      severity: violation.requestCount > violation.limit * 2 ? 'high' : 'medium',
      userId: violation.userId,
      ip: violation.ip,
      description: 'Rate limit violation detected',
      metadata: {
        operation: violation.operation,
        requestCount: violation.requestCount,
        limit: violation.limit,
        timeWindow: violation.timeWindowMs
      }
    });
  });

// Cleanup old security data
export const cleanupSecurityData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    await Promise.all([
      SecurityMonitor.cleanup(),
      RateLimiter.cleanup()
    ]);
  });

// Monitor suspicious IP patterns
export const monitorSuspiciousIPs = functions.firestore
  .document('security_alerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data();
    if (!alert.ip) return;

    // Check for distributed attack patterns
    const recentAlerts = await functions.firestore()
      .collection('security_alerts')
      .where('ip', '==', alert.ip)
      .where('timestamp', '>', new Date(Date.now() - 3600000))
      .get();

    if (recentAlerts.size >= 10) {
      const operations = new Set();
      recentAlerts.forEach(doc => {
        const data = doc.data();
        if (data.metadata?.operation) {
          operations.add(data.metadata.operation);
        }
      });

      // If multiple operations are targeted, it might be a distributed attack
      if (operations.size >= 3) {
        await SecurityMonitor.logSecurityAlert({
          type: 'suspicious_rate_limit',
          severity: 'critical',
          ip: alert.ip,
          description: 'Potential distributed attack detected',
          metadata: {
            operations: Array.from(operations),
            alertCount: recentAlerts.size
          }
        });
      }
    }
  });

// Monitor authentication anomalies
export const monitorAuthAnomalies = functions.auth
  .user()
  .onCreate(async (user) => {
    // Check for suspicious email patterns
    const suspiciousPatterns = [
      /[0-9]{8,}/, // Many numbers in email
      /.{20,}@/, // Very long local part
      /[^a-zA-Z0-9._%+-]/ // Unusual characters
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(user.email || ''))) {
      await SecurityMonitor.logSecurityAlert({
        type: 'suspicious_rate_limit',
        severity: 'medium',
        userId: user.uid,
        description: 'Suspicious user registration detected',
        metadata: {
          email: user.email,
          creationTime: user.metadata.creationTime
        }
      });
    }
  });
