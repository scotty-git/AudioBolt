import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import axios from 'axios';

const db = getFirestore();

interface SecurityAlert {
  type: 'unauthorized_access' | 'suspicious_rate_limit' | 'rule_bypass_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: FirebaseFirestore.Timestamp;
}

interface SecurityConfig {
  alertThresholds: {
    unauthorized_access: number;
    suspicious_rate_limit: number;
    rule_bypass_attempt: number;
  };
  notificationChannels: {
    email?: string[];
    slack?: string;
    webhook?: string;
  };
  ipBlockThreshold: number;
  userBlockThreshold: number;
}

export class SecurityMonitor {
  private static async getConfig(): Promise<SecurityConfig> {
    const doc = await db.collection('security_config').doc('default').get();
    return doc.data() as SecurityConfig;
  }

  private static async notifySecurityTeam(alert: SecurityAlert): Promise<void> {
    const config = await this.getConfig();

    if (config.notificationChannels.slack) {
      await this.sendSlackAlert(config.notificationChannels.slack, alert);
    }

    if (config.notificationChannels.email) {
      await this.sendEmailAlert(config.notificationChannels.email, alert);
    }

    if (config.notificationChannels.webhook) {
      await this.sendWebhookAlert(config.notificationChannels.webhook, alert);
    }
  }

  private static async sendSlackAlert(webhookUrl: string, alert: SecurityAlert): Promise<void> {
    const color = {
      low: '#36a64f',
      medium: '#ffcc00',
      high: '#ff9900',
      critical: '#ff0000'
    }[alert.severity];

    try {
      await axios.post(webhookUrl, {
        attachments: [{
          color,
          title: `Security Alert: ${alert.type}`,
          fields: [
            {
              title: 'Severity',
              value: alert.severity,
              short: true
            },
            {
              title: 'Description',
              value: alert.description,
              short: false
            },
            {
              title: 'User ID',
              value: alert.userId || 'N/A',
              short: true
            },
            {
              title: 'IP',
              value: alert.ip || 'N/A',
              short: true
            }
          ],
          footer: 'AudioBolt Security Monitor'
        }]
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private static async sendEmailAlert(recipients: string[], alert: SecurityAlert): Promise<void> {
    // Implementation would depend on your email service
    console.log('Sending email alert to:', recipients, alert);
  }

  private static async sendWebhookAlert(webhookUrl: string, alert: SecurityAlert): Promise<void> {
    try {
      await axios.post(webhookUrl, alert);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  static async logSecurityAlert(alert: Omit<SecurityAlert, 'timestamp'>): Promise<void> {
    const fullAlert = {
      ...alert,
      timestamp: FieldValue.serverTimestamp()
    };

    await db.collection('security_alerts').add(fullAlert);

    if (alert.severity === 'high' || alert.severity === 'critical') {
      await this.notifySecurityTeam(fullAlert as SecurityAlert);
    }

    // Check for threshold violations
    await this.checkSecurityThresholds(alert);
  }

  private static async checkSecurityThresholds(alert: Omit<SecurityAlert, 'timestamp'>): Promise<void> {
    const config = await this.getConfig();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // Check IP-based thresholds
    if (alert.ip) {
      const ipAlerts = await db.collection('security_alerts')
        .where('ip', '==', alert.ip)
        .where('timestamp', '>', oneHourAgo)
        .get();

      if (ipAlerts.size >= config.ipBlockThreshold) {
        await this.blockIP(alert.ip);
      }
    }

    // Check user-based thresholds
    if (alert.userId) {
      const userAlerts = await db.collection('security_alerts')
        .where('userId', '==', alert.userId)
        .where('timestamp', '>', oneHourAgo)
        .get();

      if (userAlerts.size >= config.userBlockThreshold) {
        await this.blockUser(alert.userId);
      }
    }

    // Check alert type thresholds
    const typeAlerts = await db.collection('security_alerts')
      .where('type', '==', alert.type)
      .where('timestamp', '>', oneHourAgo)
      .get();

    if (typeAlerts.size >= config.alertThresholds[alert.type]) {
      await this.notifySecurityTeam({
        ...alert,
        severity: 'critical',
        description: `Alert threshold exceeded for ${alert.type}`,
        timestamp: Timestamp.now()
      });
    }
  }

  private static async blockIP(ip: string): Promise<void> {
    await db.collection('blocked_ips').doc(ip).set({
      ip,
      blockedAt: FieldValue.serverTimestamp(),
      reason: 'Exceeded security threshold'
    });

    await this.notifySecurityTeam({
      type: 'suspicious_rate_limit',
      severity: 'critical',
      ip,
      description: 'IP automatically blocked due to suspicious activity',
      metadata: {},
      timestamp: Timestamp.now()
    });
  }

  private static async blockUser(userId: string): Promise<void> {
    await db.collection('users').doc(userId).update({
      status: 'blocked',
      blockedAt: FieldValue.serverTimestamp(),
      blockedReason: 'Exceeded security threshold'
    });

    await this.notifySecurityTeam({
      type: 'suspicious_rate_limit',
      severity: 'critical',
      userId,
      description: 'User automatically blocked due to suspicious activity',
      metadata: {},
      timestamp: Timestamp.now()
    });
  }

  static async cleanup(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const batch = db.batch();
    let count = 0;

    const snapshot = await db.collection('security_alerts')
      .where('timestamp', '<', thirtyDaysAgo)
      .get();

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;

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
