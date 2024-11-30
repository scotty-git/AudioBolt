import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import axios from 'axios';
import { 
  UsageMetrics, 
  LatencyMetrics, 
  RateLimitViolation,
  PerformanceMetric,
  AlertConfig,
  Alert 
} from './types';

const db = getFirestore();

export class FirestoreMonitor {
  private static async getAlertConfig(configId: string): Promise<AlertConfig> {
    const doc = await db.collection('alert_configs').doc(configId).get();
    return doc.data() as AlertConfig;
  }

  private static async sendAlert(alert: Alert): Promise<void> {
    const config = await this.getAlertConfig(alert.configId);
    
    // Check cooldown period
    if (config.lastAlertSent) {
      const cooldownMs = config.cooldownMinutes * 60 * 1000;
      const timeSinceLastAlert = Date.now() - config.lastAlertSent.toMillis();
      if (timeSinceLastAlert < cooldownMs) {
        return;
      }
    }

    // Store alert
    await db.collection('alerts').add({
      ...alert,
      timestamp: FieldValue.serverTimestamp()
    });

    // Send to configured channels
    if (config.channels.email) {
      await this.sendEmailAlert(config.channels.email, alert);
    }
    
    if (config.channels.slack) {
      await this.sendSlackAlert(config.channels.slack, alert);
    }

    // Update last alert timestamp
    await db.collection('alert_configs').doc(alert.configId).update({
      lastAlertSent: FieldValue.serverTimestamp()
    });
  }

  private static async sendEmailAlert(recipients: string[], alert: Alert): Promise<void> {
    // Implementation would depend on your email service (SendGrid, Nodemailer, etc.)
    // This is a placeholder for the email sending logic
    console.log('Sending email alert to:', recipients, alert);
  }

  private static async sendSlackAlert(webhookUrl: string, alert: Alert): Promise<void> {
    const color = alert.severity === 'critical' ? '#FF0000' : '#FFA500';
    
    try {
      await axios.post(webhookUrl, {
        attachments: [{
          color,
          title: `${alert.severity.toUpperCase()} Alert: ${alert.message}`,
          fields: [
            {
              title: 'Metric',
              value: alert.metric.name,
              short: true
            },
            {
              title: 'Value',
              value: alert.metric.value,
              short: true
            },
            {
              title: 'Threshold',
              value: alert.metric.threshold,
              short: true
            },
            {
              title: 'Timestamp',
              value: alert.timestamp.toDate().toISOString(),
              short: true
            }
          ],
          footer: 'AudioBolt Monitoring System'
        }]
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  static async logUsageMetrics(metrics: Omit<UsageMetrics, 'timestamp' | 'date'>): Promise<void> {
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    await db.collection('usage_metrics').add({
      ...metrics,
      timestamp: FieldValue.serverTimestamp(),
      date
    });
  }

  static async logLatencyMetric(metric: Omit<LatencyMetrics, 'timestamp'>): Promise<void> {
    const doc = await db.collection('latency_metrics').add({
      ...metric,
      timestamp: FieldValue.serverTimestamp()
    });

    // Check latency thresholds
    if (metric.latencyMs > 1000) { // 1 second threshold
      await this.sendAlert({
        configId: 'latency-alert',
        severity: metric.latencyMs > 2000 ? 'critical' : 'warning',
        message: `High latency detected for ${metric.operationType} operation`,
        timestamp: Timestamp.now(),
        metric: {
          name: 'operation_latency',
          value: metric.latencyMs,
          threshold: 1000
        },
        metadata: {
          path: metric.path,
          userId: metric.userId
        }
      });
    }
  }

  static async logRateLimitViolation(violation: Omit<RateLimitViolation, 'timestamp'>): Promise<void> {
    await db.collection('rate_limit_violations').add({
      ...violation,
      timestamp: FieldValue.serverTimestamp()
    });

    // Alert on repeated violations
    const recentViolations = await db.collection('rate_limit_violations')
      .where('userId', '==', violation.userId)
      .where('timestamp', '>', Timestamp.fromMillis(Date.now() - 3600000)) // Last hour
      .get();

    if (recentViolations.size > 10) {
      await this.sendAlert({
        configId: 'rate-limit-alert',
        severity: 'warning',
        message: `Multiple rate limit violations from user`,
        timestamp: Timestamp.now(),
        metric: {
          name: 'rate_limit_violations',
          value: recentViolations.size,
          threshold: 10
        },
        metadata: {
          userId: violation.userId,
          operation: violation.operation
        }
      });
    }
  }

  static async logPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    await db.collection('performance_metrics').add({
      ...metric,
      timestamp: FieldValue.serverTimestamp()
    });
  }

  static async aggregateDailyMetrics(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];

    // Aggregate usage metrics
    const usageSnapshot = await db.collection('usage_metrics')
      .where('date', '==', date)
      .get();

    const usage = usageSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data() as UsageMetrics;
      return {
        reads: acc.reads + data.reads,
        writes: acc.writes + data.writes,
        deletes: acc.deletes + data.deletes,
        totalQueries: acc.totalQueries + data.totalQueries
      };
    }, { reads: 0, writes: 0, deletes: 0, totalQueries: 0 });

    // Aggregate latency metrics
    const latencySnapshot = await db.collection('latency_metrics')
      .where('timestamp', '>', yesterday)
      .get();

    const latencyByOperation = latencySnapshot.docs.reduce((acc, doc) => {
      const data = doc.data() as LatencyMetrics;
      if (!acc[data.operationType]) {
        acc[data.operationType] = {
          total: 0,
          count: 0,
          max: 0
        };
      }
      acc[data.operationType].total += data.latencyMs;
      acc[data.operationType].count++;
      acc[data.operationType].max = Math.max(acc[data.operationType].max, data.latencyMs);
      return acc;
    }, {} as Record<string, { total: number; count: number; max: number; }>);

    // Store daily summary
    await db.collection('daily_summaries').add({
      date,
      usage,
      latency: Object.entries(latencyByOperation).reduce((acc, [op, stats]) => {
        acc[op] = {
          average: stats.total / stats.count,
          max: stats.max,
          count: stats.count
        };
        return acc;
      }, {} as Record<string, any>),
      timestamp: FieldValue.serverTimestamp()
    });
  }
}
