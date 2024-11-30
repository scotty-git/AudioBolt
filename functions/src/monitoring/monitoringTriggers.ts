import * as functions from 'firebase-functions';
import * as perf from 'firebase-performance';
import { FirestoreMonitor } from './firestoreMonitor';
import { PerformanceMonitoring } from '@firebase/performance-types';

// Track Firestore operations
export const trackFirestoreOperation = functions.firestore
  .document('{collection}/{docId}')
  .onWrite(async (change, context) => {
    const startTime = Date.now();
    const path = `${context.params.collection}/${context.params.docId}`;

    let operationType: 'write' | 'delete';
    if (!change.after.exists) {
      operationType = 'delete';
    } else if (!change.before.exists) {
      operationType = 'write';
    } else {
      operationType = 'write';
    }

    // Log operation latency
    const latencyMs = Date.now() - startTime;
    await FirestoreMonitor.logLatencyMetric({
      operationType,
      latencyMs,
      path,
      userId: context.auth?.uid
    });

    // Log usage metrics
    await FirestoreMonitor.logUsageMetrics({
      reads: 1,
      writes: operationType === 'write' ? 1 : 0,
      deletes: operationType === 'delete' ? 1 : 0,
      totalQueries: 1
    });
  });

// Daily metrics aggregation
export const aggregateDailyMetrics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    await FirestoreMonitor.aggregateDailyMetrics();
  });

// Monitor query performance
export const monitorQueryPerformance = functions.https.onRequest(async (req, res) => {
  const trace = perf.trace('firestore_query');
  trace.start();

  try {
    // Your query logic here
    // This is just an example
    const result = await functions.firestore()
      .collection('submissions')
      .limit(10)
      .get();

    trace.stop();

    // Log performance metric
    await FirestoreMonitor.logPerformanceMetric({
      name: 'query_execution_time',
      value: trace.getDurationMillis(),
      metadata: {
        queryPath: 'submissions',
        resultCount: result.size
      }
    });

    res.json({ success: true });
  } catch (error) {
    trace.stop();
    console.error('Query failed:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

// Rate limit monitoring
export const monitorRateLimits = functions.firestore
  .document('rate_limit_violations/{violationId}')
  .onCreate(async (snap, context) => {
    const violation = snap.data();
    
    await FirestoreMonitor.logRateLimitViolation({
      userId: violation.userId,
      operation: violation.operation,
      requestCount: violation.requestCount,
      timeWindowMs: violation.timeWindowMs,
      limit: violation.limit
    });
  });

// Performance monitoring initialization
export const initializePerformanceMonitoring = functions.https.onRequest((req, res) => {
  const performance = perf.getInstance();
  
  // Configure performance monitoring
  performance.setInstrumentationEnabled(true);
  performance.dataCollectionEnabled = true;

  // Set up custom traces
  const customTraces = [
    'submission_creation',
    'submission_query',
    'submission_update',
    'submission_archive'
  ];

  customTraces.forEach(traceName => {
    const trace = performance.trace(traceName);
    trace.putAttribute('version', '1.0.0');
  });

  res.json({ success: true, message: 'Performance monitoring initialized' });
});

// Alert cleanup
export const cleanupOldAlerts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldAlerts = await functions.firestore()
      .collection('alerts')
      .where('timestamp', '<', thirtyDaysAgo)
      .get();

    const batch = functions.firestore().batch();
    oldAlerts.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  });
