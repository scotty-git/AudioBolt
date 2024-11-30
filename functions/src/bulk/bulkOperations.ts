import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import {
  BulkOperation,
  BulkOperationError,
  BulkArchiveRequest,
  BulkUpdateRequest,
  BulkOperationResponse,
  BulkOperationStatus
} from './types';

const db = getFirestore();
const MAX_BATCH_SIZE = 500;
const DEFAULT_BATCH_SIZE = 100;

export class BulkOperationsService {
  private static async createOperation(
    type: BulkOperation['type'],
    userId: string,
    targetIds: string[],
    filters?: BulkOperation['filters'],
    options?: BulkOperation['options']
  ): Promise<string> {
    const operation: Omit<BulkOperation, 'id'> = {
      type,
      status: 'pending',
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      targetIds,
      filters,
      options: {
        batchSize: DEFAULT_BATCH_SIZE,
        ...options
      },
      progress: {
        total: targetIds.length,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    const doc = await db.collection('bulk_operations').add(operation);
    return doc.id;
  }

  private static async updateOperationStatus(
    operationId: string,
    status: BulkOperationStatus,
    updates: Partial<BulkOperation> = {}
  ): Promise<void> {
    await db.collection('bulk_operations').doc(operationId).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
      ...updates,
      ...(status === 'completed' || status === 'failed' ? {
        completedAt: FieldValue.serverTimestamp()
      } : {})
    });
  }

  private static async validateOperation(operation: BulkOperation): Promise<void> {
    if (operation.targetIds.length === 0 && !operation.filters) {
      throw new BulkOperationError(
        'Either targetIds or filters must be provided',
        'invalid_request',
        operation
      );
    }

    if (operation.options?.batchSize && (
      operation.options.batchSize > MAX_BATCH_SIZE ||
      operation.options.batchSize < 1
    )) {
      throw new BulkOperationError(
        `Batch size must be between 1 and ${MAX_BATCH_SIZE}`,
        'invalid_batch_size',
        operation
      );
    }
  }

  private static async processInBatches<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<void>
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processor(batch);
    }
  }

  static async bulkArchiveSubmissions(
    userId: string,
    request: BulkArchiveRequest
  ): Promise<BulkOperationResponse> {
    let targetIds = request.targetIds || [];

    // If filters provided, query for matching submissions
    if (request.filters) {
      let query = db.collection('submissions');

      if (request.filters.status) {
        query = query.where('status', 'in', request.filters.status);
      }

      if (request.filters.lastActiveDate) {
        const date = new Date(request.filters.lastActiveDate);
        query = query.where('lastActiveDate', '<=', date);
      }

      if (request.filters.templateIds) {
        query = query.where('templateId', 'in', request.filters.templateIds);
      }

      const snapshot = await query.get();
      targetIds = snapshot.docs.map(doc => doc.id);
    }

    const operationId = await this.createOperation(
      'archive_submissions',
      userId,
      targetIds,
      request.filters,
      request.options
    );

    // Start processing if not dry run
    if (!request.options?.dryRun) {
      this.processArchiveOperation(operationId).catch(error => {
        console.error('Bulk archive operation failed:', error);
      });
    }

    return {
      operationId,
      status: 'pending',
      message: `Bulk archive operation created for ${targetIds.length} submissions`,
      dryRun: request.options?.dryRun
    };
  }

  private static async processArchiveOperation(operationId: string): Promise<void> {
    const opRef = db.collection('bulk_operations').doc(operationId);
    const operation = (await opRef.get()).data() as BulkOperation;

    await this.validateOperation(operation);
    await this.updateOperationStatus(operationId, 'in_progress');

    const batchSize = operation.options?.batchSize || DEFAULT_BATCH_SIZE;
    const result: BulkOperation['result'] = {
      successful: [],
      failed: [],
      skipped: []
    };

    try {
      await this.processInBatches(operation.targetIds, batchSize, async (batch) => {
        const writeBatch = db.batch();
        
        for (const id of batch) {
          const submissionRef = db.collection('submissions').doc(id);
          const submission = await submissionRef.get();

          if (!submission.exists) {
            result.skipped.push({ id, reason: 'not_found' });
            continue;
          }

          try {
            writeBatch.update(submissionRef, {
              status: 'archived',
              archivedAt: FieldValue.serverTimestamp(),
              archivedBy: operation.createdBy,
              archiveReason: operation.options?.reason
            });

            result.successful.push(id);
          } catch (error) {
            result.failed.push({ id, error: error.message });
          }
        }

        await writeBatch.commit();

        // Update progress
        await opRef.update({
          'progress.processed': FieldValue.increment(batch.length),
          'progress.successful': FieldValue.increment(result.successful.length),
          'progress.failed': FieldValue.increment(result.failed.length),
          'progress.skipped': FieldValue.increment(result.skipped.length),
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      const status = result.failed.length > 0 ? 'partially_completed' : 'completed';
      await this.updateOperationStatus(operationId, status, { result });
    } catch (error) {
      await this.updateOperationStatus(operationId, 'failed', {
        error: error.message,
        result
      });
      throw error;
    }
  }

  static async bulkUpdateSubmissions(
    userId: string,
    request: BulkUpdateRequest
  ): Promise<BulkOperationResponse> {
    let targetIds = request.targetIds || [];

    if (request.filters) {
      let query = db.collection('submissions');

      if (request.filters.status) {
        query = query.where('status', 'in', request.filters.status);
      }

      if (request.filters.templateIds) {
        query = query.where('templateId', 'in', request.filters.templateIds);
      }

      const snapshot = await query.get();
      targetIds = snapshot.docs.map(doc => doc.id);
    }

    const operationId = await this.createOperation(
      'update_status',
      userId,
      targetIds,
      request.filters,
      request.options
    );

    if (!request.options?.dryRun) {
      this.processUpdateOperation(operationId, request.updates).catch(error => {
        console.error('Bulk update operation failed:', error);
      });
    }

    return {
      operationId,
      status: 'pending',
      message: `Bulk update operation created for ${targetIds.length} submissions`,
      dryRun: request.options?.dryRun
    };
  }

  private static async processUpdateOperation(
    operationId: string,
    updates: BulkUpdateRequest['updates']
  ): Promise<void> {
    const opRef = db.collection('bulk_operations').doc(operationId);
    const operation = (await opRef.get()).data() as BulkOperation;

    await this.validateOperation(operation);
    await this.updateOperationStatus(operationId, 'in_progress');

    const batchSize = operation.options?.batchSize || DEFAULT_BATCH_SIZE;
    const result: BulkOperation['result'] = {
      successful: [],
      failed: [],
      skipped: []
    };

    try {
      await this.processInBatches(operation.targetIds, batchSize, async (batch) => {
        const writeBatch = db.batch();

        for (const id of batch) {
          const submissionRef = db.collection('submissions').doc(id);
          const submission = await submissionRef.get();

          if (!submission.exists) {
            result.skipped.push({ id, reason: 'not_found' });
            continue;
          }

          try {
            writeBatch.update(submissionRef, {
              ...updates,
              updatedAt: FieldValue.serverTimestamp(),
              updatedBy: operation.createdBy
            });

            result.successful.push(id);
          } catch (error) {
            result.failed.push({ id, error: error.message });
          }
        }

        await writeBatch.commit();

        await opRef.update({
          'progress.processed': FieldValue.increment(batch.length),
          'progress.successful': FieldValue.increment(result.successful.length),
          'progress.failed': FieldValue.increment(result.failed.length),
          'progress.skipped': FieldValue.increment(result.skipped.length),
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      const status = result.failed.length > 0 ? 'partially_completed' : 'completed';
      await this.updateOperationStatus(operationId, status, { result });
    } catch (error) {
      await this.updateOperationStatus(operationId, 'failed', {
        error: error.message,
        result
      });
      throw error;
    }
  }
}
