import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

const db = getFirestore();

interface RateLimit {
  operation: string;
  requestsPerMinute: number;
  requestsPerSecond: number;
  windowSize: number; // in milliseconds
}

const RATE_LIMITS: Record<string, RateLimit> = {
  createSubmission: {
    operation: 'create',
    requestsPerMinute: 20,
    requestsPerSecond: 2,
    windowSize: 60000 // 1 minute
  },
  querySubmissions: {
    operation: 'query',
    requestsPerMinute: 900, // 15 per second
    requestsPerSecond: 15,
    windowSize: 60000
  }
};

export class RateLimiter {
  private static async checkRateLimit(
    userId: string,
    operation: string
  ): Promise<void> {
    const limit = RATE_LIMITS[operation];
    if (!limit) return;

    const userRateLimitRef = db.collection('rate_limits')
      .doc(`${userId}_${operation}`);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userRateLimitRef);
        const now = Date.now();

        if (!doc.exists) {
          // First request
          transaction.set(userRateLimitRef, {
            count: 1,
            firstRequest: now,
            lastRequest: now
          });
          return;
        }

        const data = doc.data()!;
        const windowStart = now - limit.windowSize;

        if (data.firstRequest < windowStart) {
          // Reset window
          transaction.set(userRateLimitRef, {
            count: 1,
            firstRequest: now,
            lastRequest: now
          });
          return;
        }

        // Check rate limits
        const requestsPerMinute = (data.count / 
          ((now - data.firstRequest) / 60000));
        
        const timeSinceLastRequest = now - data.lastRequest;
        const requestsPerSecond = timeSinceLastRequest < 1000 ? 
          Infinity : 1000 / timeSinceLastRequest;

        if (requestsPerMinute > limit.requestsPerMinute ||
            requestsPerSecond > limit.requestsPerSecond) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            `Rate limit exceeded for ${operation}. Please try again later.`
          );
        }

        // Update counters
        transaction.update(userRateLimitRef, {
          count: data.count + 1,
          lastRequest: now
        });
      });
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error(`Rate limit check failed for ${userId}:${operation}`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to check rate limit'
      );
    }
  }

  static async enforceRateLimit(
    operation: string,
    context: functions.https.CallableContext
  ): Promise<void> {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }

    await this.checkRateLimit(context.auth.uid, operation);
  }

  static async clearRateLimits(userId: string): Promise<void> {
    const batch = db.batch();
    const snapshot = await db.collection('rate_limits')
      .where('userId', '==', userId)
      .get();

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
