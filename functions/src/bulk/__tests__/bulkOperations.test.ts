import * as admin from 'firebase-admin';
import { BulkOperationsService } from '../bulkOperations';
import { 
  initializeTestEnvironment,
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';

describe('Bulk Operations', () => {
  let testEnv: RulesTestEnvironment;
  let adminApp: admin.app.App;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-project',
      firestore: {
        host: 'localhost',
        port: 8080
      }
    });

    adminApp = admin.initializeApp({
      projectId: 'demo-project'
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
    await adminApp.delete();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Bulk Archive', () => {
    it('should archive submissions by IDs', async () => {
      // Create test submissions
      const submissions = await Promise.all([
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          createdAt: admin.firestore.Timestamp.now()
        }),
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          createdAt: admin.firestore.Timestamp.now()
        })
      ]);

      const response = await BulkOperationsService.bulkArchiveSubmissions(
        'test-admin',
        {
          targetIds: submissions.map(s => s.id),
          options: { batchSize: 1 }
        }
      );

      expect(response.status).toBe('pending');

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify submissions are archived
      for (const submission of submissions) {
        const doc = await submission.get();
        expect(doc.data()?.status).toBe('archived');
      }
    });

    it('should archive submissions by filter', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30);

      // Create test submissions
      await Promise.all([
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          lastActiveDate: oldDate,
          createdAt: admin.firestore.Timestamp.now()
        }),
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          lastActiveDate: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now()
        })
      ]);

      const response = await BulkOperationsService.bulkArchiveSubmissions(
        'test-admin',
        {
          filters: {
            lastActiveDate: oldDate.toISOString().split('T')[0]
          }
        }
      );

      expect(response.status).toBe('pending');

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify only old submissions are archived
      const submissions = await testEnv.firestore()
        .collection('submissions')
        .get();

      const archived = submissions.docs
        .filter(doc => doc.data().status === 'archived');
      expect(archived.length).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      const response = await BulkOperationsService.bulkArchiveSubmissions(
        'test-admin',
        {
          targetIds: ['non-existent-id'],
          options: { force: true }
        }
      );

      expect(response.status).toBe('pending');

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify operation status
      const operation = await testEnv.firestore()
        .collection('bulk_operations')
        .doc(response.operationId)
        .get();

      expect(operation.data()?.status).toBe('completed');
      expect(operation.data()?.result.skipped.length).toBe(1);
    });
  });

  describe('Bulk Update', () => {
    it('should update submissions in batches', async () => {
      // Create test submissions
      const submissions = await Promise.all([
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          metadata: { priority: 'low' }
        }),
        testEnv.firestore().collection('submissions').add({
          status: 'active',
          metadata: { priority: 'low' }
        })
      ]);

      const response = await BulkOperationsService.bulkUpdateSubmissions(
        'test-admin',
        {
          targetIds: submissions.map(s => s.id),
          updates: {
            status: 'in_review',
            metadata: { priority: 'high' }
          },
          options: { batchSize: 1 }
        }
      );

      expect(response.status).toBe('pending');

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify updates
      for (const submission of submissions) {
        const doc = await submission.get();
        const data = doc.data();
        expect(data?.status).toBe('in_review');
        expect(data?.metadata.priority).toBe('high');
      }
    });

    it('should respect rate limits', async () => {
      // Create many test submissions
      const submissions = await Promise.all(
        Array(600).fill(null).map(() => 
          testEnv.firestore().collection('submissions').add({
            status: 'active'
          })
        )
      );

      const response = await BulkOperationsService.bulkUpdateSubmissions(
        'test-admin',
        {
          targetIds: submissions.map(s => s.id),
          updates: { status: 'in_review' }
        }
      );

      expect(response.status).toBe('pending');

      // Verify operation uses correct batch size
      const operation = await testEnv.firestore()
        .collection('bulk_operations')
        .doc(response.operationId)
        .get();

      expect(operation.data()?.options.batchSize).toBeLessThanOrEqual(500);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large payloads efficiently', async () => {
      // Create 1000 test submissions
      const submissions = await Promise.all(
        Array(1000).fill(null).map(() => 
          testEnv.firestore().collection('submissions').add({
            status: 'active',
            data: 'x'.repeat(1000) // 1KB of data
          })
        )
      );

      const startTime = Date.now();

      const response = await BulkOperationsService.bulkUpdateSubmissions(
        'test-admin',
        {
          targetIds: submissions.map(s => s.id),
          updates: { status: 'archived' },
          options: { batchSize: 500 }
        }
      );

      // Wait for operation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Operation should complete within reasonable time
      expect(duration).toBeLessThan(5000);

      // Verify all submissions were updated
      const operation = await testEnv.firestore()
        .collection('bulk_operations')
        .doc(response.operationId)
        .get();

      expect(operation.data()?.progress.successful).toBe(1000);
    });
  });
});
