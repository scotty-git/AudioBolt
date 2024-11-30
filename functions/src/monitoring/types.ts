import { Timestamp } from 'firebase-admin/firestore';

export interface UsageMetrics {
  reads: number;
  writes: number;
  deletes: number;
  totalQueries: number;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD format
}

export interface LatencyMetrics {
  operationType: 'read' | 'write' | 'query' | 'delete';
  latencyMs: number;
  path: string;
  timestamp: Timestamp;
  userId?: string;
}

export interface RateLimitViolation {
  userId: string;
  operation: string;
  timestamp: Timestamp;
  requestCount: number;
  timeWindowMs: number;
  limit: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

export interface AlertConfig {
  name: string;
  enabled: boolean;
  thresholds: {
    warning?: number;
    critical?: number;
  };
  channels: {
    email?: string[];
    slack?: string; // Webhook URL
  };
  cooldownMinutes: number;
  lastAlertSent?: Timestamp;
}

export interface Alert {
  configId: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Timestamp;
  metric: {
    name: string;
    value: number;
    threshold: number;
  };
  metadata?: Record<string, any>;
}
