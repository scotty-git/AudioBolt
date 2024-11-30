import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const SLOW_QUERY_THRESHOLD = 500; // milliseconds

interface QueryLogEntry {
  userId: string;
  operation: string;
  parameters: Record<string, any>;
  executionTimeMs: number;
  timestamp: FirebaseFirestore.FieldValue;
  path: string;
}

export class QueryLogger {
  private static async logSlowQuery(entry: Omit<QueryLogEntry, 'timestamp'>) {
    if (entry.executionTimeMs < SLOW_QUERY_THRESHOLD) {
      return;
    }

    try {
      await db.collection('query_logs').add({
        ...entry,
        timestamp: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log slow query:', error);
    }
  }

  static async trackQuery<T>(
    operation: string,
    path: string,
    userId: string,
    parameters: Record<string, any>,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const executionTimeMs = Date.now() - startTime;

      await this.logSlowQuery({
        userId,
        operation,
        parameters,
        executionTimeMs,
        path
      });

      return result;
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      await this.logSlowQuery({
        userId,
        operation,
        parameters,
        executionTimeMs,
        path,
        error: error.message
      });

      throw error;
    }
  }

  static async getQueryStats(timeWindowMs: number = 3600000) {
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    
    const snapshot = await db.collection('query_logs')
      .where('timestamp', '>=', cutoffTime)
      .orderBy('timestamp', 'desc')
      .get();

    const stats = {
      totalQueries: snapshot.size,
      averageExecutionTime: 0,
      slowestQueries: [] as any[],
      operationCounts: {} as Record<string, number>
    };

    let totalExecutionTime = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalExecutionTime += data.executionTimeMs;
      
      stats.operationCounts[data.operation] = 
        (stats.operationCounts[data.operation] || 0) + 1;

      if (stats.slowestQueries.length < 10) {
        stats.slowestQueries.push({
          ...data,
          id: doc.id
        });
      }
    });

    if (stats.totalQueries > 0) {
      stats.averageExecutionTime = totalExecutionTime / stats.totalQueries;
    }

    return stats;
  }
}
