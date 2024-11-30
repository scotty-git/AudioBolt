import { Timestamp } from 'firebase-admin/firestore';

export type BulkOperationType = 
  | 'archive_submissions'
  | 'archive_templates'
  | 'update_status'
  | 'update_metadata'
  | 'delete_templates';

export type BulkOperationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'partially_completed';

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  skipped: Array<{
    id: string;
    reason: string;
  }>;
}

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  targetIds: string[];
  filters?: {
    lastActiveDate?: Timestamp;
    status?: string[];
    templateIds?: string[];
    metadata?: Record<string, any>;
  };
  options?: {
    dryRun?: boolean;
    batchSize?: number;
    reason?: string;
    force?: boolean;
  };
  result?: BulkOperationResult;
  error?: string;
  progress?: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

export interface BulkArchiveRequest {
  targetIds?: string[];
  filters?: {
    lastActiveDate?: string; // ISO date string
    status?: string[];
    templateIds?: string[];
  };
  options?: {
    dryRun?: boolean;
    batchSize?: number;
    reason?: string;
    force?: boolean;
  };
}

export interface BulkUpdateRequest {
  targetIds?: string[];
  filters?: {
    status?: string[];
    templateIds?: string[];
    metadata?: Record<string, any>;
  };
  updates: {
    status?: string;
    metadata?: Record<string, any>;
  };
  options?: {
    dryRun?: boolean;
    batchSize?: number;
    reason?: string;
  };
}

export interface BulkOperationResponse {
  operationId: string;
  status: BulkOperationStatus;
  message: string;
  dryRun?: boolean;
}

export class BulkOperationError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: BulkOperation
  ) {
    super(message);
    this.name = 'BulkOperationError';
  }
}
