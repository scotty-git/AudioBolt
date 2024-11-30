import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable
} from 'firebase/functions';
import { getAuth } from 'firebase/auth';

describe('Submission E2E Tests', () => {
  let testEnv: RulesTestEnvironment;
  let normalUser: any;
  let adminUser: any;
  let submissionId: string;

  beforeAll(async () => {
    // Initialize test environment
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-project',
      firestore: {
        host: 'localhost',
        port: 8080
      }
    });

    // Connect to emulators
    const auth = getAuth();
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    const functions = getFunctions();
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Create test users
    normalUser = await createUserWithEmailAndPassword(
      auth,
      'user@test.com',
      'password123'
    );

    adminUser = await createUserWithEmailAndPassword(
      auth,
      'admin@test.com',
      'password123'
    );

    // Set up admin user in Firestore
    await testEnv.firestore().collection('users').doc(adminUser.user.uid).set({
      role: 'admin',
      email: adminUser.user.email
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('Submission Workflow', () => {
    it('should create, query, update, and archive a submission', async () => {
      // Sign in as normal user
      await signInWithEmailAndPassword(getAuth(), 'user@test.com', 'password123');

      // 1. Create submission
      const createSubmission = httpsCallable(getFunctions(), 'createSubmission');
      const createResult = await createSubmission({
        templateId: 'test-template',
        responses: { question1: 'answer1' }
      });

      expect(createResult.data.success).toBe(true);
      submissionId = createResult.data.submissionId;

      // 2. Query submissions
      const querySubmissions = httpsCallable(getFunctions(), 'querySubmissions');
      const queryResult = await querySubmissions({
        status: 'in_progress'
      });

      expect(queryResult.data.items).toHaveLength(1);
      expect(queryResult.data.items[0].id).toBe(submissionId);

      // 3. Update submission
      const updateSubmission = httpsCallable(getFunctions(), 'updateSubmission');
      const updateResult = await updateSubmission({
        submissionId,
        responses: { question1: 'updated_answer' }
      });

      expect(updateResult.data.success).toBe(true);

      // 4. Archive submission
      const archiveSubmission = httpsCallable(getFunctions(), 'archiveSubmission');
      const archiveResult = await archiveSubmission({
        submissionId,
        reason: 'Test archive'
      });

      expect(archiveResult.data.success).toBe(true);

      // Verify final state
      const finalQuery = await querySubmissions({
        status: 'archived'
      });

      expect(finalQuery.data.items).toHaveLength(1);
      expect(finalQuery.data.items[0].status).toBe('archived');
    });

    it('should handle permission errors correctly', async () => {
      // Try to access another user's submission
      const querySubmissions = httpsCallable(getFunctions(), 'querySubmissions');
      
      await expect(querySubmissions({
        userId: adminUser.user.uid
      })).rejects.toThrow(/permission-denied/);
    });

    it('should handle rate limits', async () => {
      const createSubmission = httpsCallable(getFunctions(), 'createSubmission');
      
      // Attempt to exceed rate limit
      const promises = Array(25).fill(null).map(() => createSubmission({
        templateId: 'test-template',
        responses: { question1: 'answer1' }
      }));

      await expect(Promise.all(promises))
        .rejects.toThrow(/rate limit exceeded/);
    });

    it('should validate input data', async () => {
      const createSubmission = httpsCallable(getFunctions(), 'createSubmission');
      
      // Test invalid template ID
      await expect(createSubmission({
        templateId: 'non-existent',
        responses: { question1: 'answer1' }
      })).rejects.toThrow(/template not found/);

      // Test invalid responses
      await expect(createSubmission({
        templateId: 'test-template',
        responses: null
      })).rejects.toThrow(/invalid responses/);
    });
  });

  describe('Admin Operations', () => {
    beforeEach(async () => {
      await signInWithEmailAndPassword(getAuth(), 'admin@test.com', 'password123');
    });

    it('should allow admin to query all submissions', async () => {
      const querySubmissions = httpsCallable(getFunctions(), 'querySubmissions');
      const result = await querySubmissions({});

      expect(result.data.items.length).toBeGreaterThan(0);
    });

    it('should allow admin to update any submission', async () => {
      const updateSubmission = httpsCallable(getFunctions(), 'updateSubmission');
      const result = await updateSubmission({
        submissionId,
        status: 'archived'
      });

      expect(result.data.success).toBe(true);
    });
  });
});
