import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { SubmissionQueryService } from '../submissionQueryService';
import { Submission } from '../../types/submission';
import { addDays, subDays } from 'date-fns';

describe('SubmissionQueryService', () => {
  let testEnv: RulesTestEnvironment;
  let service: SubmissionQueryService;
  
  // Test data
  const userId = 'test-user-1';
  const adminId = 'admin-user';
  const templateId = 'template-1';
  
  const testSubmissions: Partial<Submission>[] = [
    {
      userId,
      templateId,
      status: 'completed',
      responses: { q1: 'a1' },
      completedAt: subDays(new Date(), 1),
      createdAt: subDays(new Date(), 2)
    },
    {
      userId,
      templateId,
      status: 'in_progress',
      responses: { q1: 'a2' },
      createdAt: subDays(new Date(), 1)
    },
    {
      userId: 'other-user',
      templateId,
      status: 'completed',
      responses: { q1: 'a3' },
      completedAt: new Date(),
      createdAt: new Date()
    }
  ];

  beforeAll(async () => {
    // Initialize test environment
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-project',
      firestore: {
        rules: `
          service cloud.firestore {
            match /databases/{database}/documents {
              match /submissions/{submissionId} {
                allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
              }
            }
          }
        `
      }
    });

    // Set up test data
    const batch = testEnv.firestore().batch();
    testSubmissions.forEach((submission, index) => {
      const ref = testEnv.firestore().collection('submissions').doc(`submission-${index + 1}`);
      batch.set(ref, submission);
    });
    await batch.commit();

    // Initialize service
    service = new SubmissionQueryService();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('querySubmissions', () => {
    it('should return user submissions filtered by status', async () => {
      const result = await service.querySubmissions({
        userId,
        status: 'completed'
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('completed');
      expect(result.items[0].userId).toBe(userId);
    });

    it('should return submissions sorted by completedAt desc by default', async () => {
      const result = await service.querySubmissions({
        userId
      });

      expect(result.items).toBeDefined();
      expect(result.items[0].completedAt).toBeDefined();
      expect(new Date(result.items[0].completedAt) > new Date(result.items[1].completedAt)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // First page
      const firstPage = await service.querySubmissions({
        userId,
        pageSize: 1
      });

      expect(firstPage.items).toHaveLength(1);
      expect(firstPage.nextPageToken).toBeDefined();

      // Second page
      const secondPage = await service.querySubmissions({
        userId,
        pageSize: 1,
        pageToken: firstPage.nextPageToken
      });

      expect(secondPage.items).toHaveLength(1);
      expect(secondPage.items[0].id).not.toBe(firstPage.items[0].id);
    });

    it('should allow admins to query all submissions', async () => {
      const result = await service.querySubmissions({
        pageSize: 10
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.some(s => s.userId !== userId)).toBe(true);
    });

    it('should filter by templateId correctly', async () => {
      const result = await service.querySubmissions({
        templateId
      });

      expect(result.items).toBeDefined();
      expect(result.items.every(s => s.templateId === templateId)).toBe(true);
    });

    it('should handle invalid page tokens', async () => {
      await expect(
        service.querySubmissions({
          userId,
          pageToken: 'invalid-token'
        })
      ).rejects.toThrow('Invalid page token');
    });
  });

  describe('getSubmissionCount', () => {
    it('should return correct count for user submissions', async () => {
      const count = await service.getSubmissionCount({
        userId
      });

      expect(count).toBe(2);
    });

    it('should return correct count for filtered submissions', async () => {
      const count = await service.getSubmissionCount({
        userId,
        status: 'completed'
      });

      expect(count).toBe(1);
    });
  });
});
