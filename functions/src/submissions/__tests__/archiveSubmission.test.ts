import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';
import { archiveSubmission, batchArchiveSubmissions } from '../archiveSubmission';

const testEnv = test();

describe('archiveSubmission', () => {
  let adminUser: admin.auth.UserRecord;
  let normalUser: admin.auth.UserRecord;
  let otherUser: admin.auth.UserRecord;
  let testSubmissionId: string;
  let archivedSubmissionId: string;

  beforeAll(async () => {
    // Create test users
    adminUser = await admin.auth().createUser({
      email: 'admin@test.com',
      password: 'password123'
    });
    await admin.firestore().collection('users').doc(adminUser.uid).set({
      role: 'admin',
      email: adminUser.email
    });

    normalUser = await admin.auth().createUser({
      email: 'user@test.com',
      password: 'password123'
    });
    await admin.firestore().collection('users').doc(normalUser.uid).set({
      role: 'user',
      email: normalUser.email
    });

    otherUser = await admin.auth().createUser({
      email: 'other@test.com',
      password: 'password123'
    });
    await admin.firestore().collection('users').doc(otherUser.uid).set({
      role: 'user',
      email: otherUser.email
    });

    // Create test submissions
    const submissionRef = admin.firestore().collection('submissions').doc();
    await submissionRef.set({
      userId: normalUser.uid,
      templateId: 'test-template',
      status: 'completed',
      responses: { q1: 'a1' },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    testSubmissionId = submissionRef.id;

    const archivedRef = admin.firestore().collection('submissions').doc();
    await archivedRef.set({
      userId: normalUser.uid,
      templateId: 'test-template',
      status: 'archived',
      responses: { q1: 'a1' },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      archivedBy: normalUser.uid
    });
    archivedSubmissionId = archivedRef.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await Promise.all([
      admin.auth().deleteUser(adminUser.uid),
      admin.auth().deleteUser(normalUser.uid),
      admin.auth().deleteUser(otherUser.uid),
      admin.firestore().collection('submissions').doc(testSubmissionId).delete(),
      admin.firestore().collection('submissions').doc(archivedSubmissionId).delete()
    ]);
    testEnv.cleanup();
  });

  describe('single submission archive', () => {
    it('should require authentication', async () => {
      const wrapped = testEnv.wrap(archiveSubmission);
      await expect(
        wrapped({ submissionId: testSubmissionId }, { auth: null })
      ).rejects.toThrow(/Must be authenticated/);
    });

    it('should allow owner to archive submission', async () => {
      const wrapped = testEnv.wrap(archiveSubmission);
      const result = await wrapped(
        {
          submissionId: testSubmissionId,
          reason: 'Test archive'
        },
        { auth: { uid: normalUser.uid } }
      );

      expect(result.success).toBe(true);

      // Verify archive
      const doc = await admin.firestore()
        .collection('submissions')
        .doc(testSubmissionId)
        .get();
      
      expect(doc.data()?.status).toBe('archived');
      expect(doc.data()?.archivedBy).toBe(normalUser.uid);
      expect(doc.data()?.archiveReason).toBe('Test archive');
      expect(doc.data()?.archivedAt).toBeDefined();
    });

    it('should prevent archiving already archived submission', async () => {
      const wrapped = testEnv.wrap(archiveSubmission);
      await expect(
        wrapped(
          { submissionId: archivedSubmissionId },
          { auth: { uid: normalUser.uid } }
        )
      ).rejects.toThrow(/already archived/);
    });

    it('should prevent non-owner from archiving', async () => {
      const wrapped = testEnv.wrap(archiveSubmission);
      await expect(
        wrapped(
          { submissionId: testSubmissionId },
          { auth: { uid: otherUser.uid } }
        )
      ).rejects.toThrow(/Not authorized/);
    });

    it('should allow admin to archive any submission', async () => {
      const submissionRef = await admin.firestore().collection('submissions').add({
        userId: otherUser.uid,
        templateId: 'test-template',
        status: 'completed',
        responses: { q1: 'a1' },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const wrapped = testEnv.wrap(archiveSubmission);
      const result = await wrapped(
        { submissionId: submissionRef.id },
        { auth: { uid: adminUser.uid } }
      );

      expect(result.success).toBe(true);

      // Cleanup
      await submissionRef.delete();
    });
  });

  describe('batch archive', () => {
    let batchSubmissionIds: string[] = [];

    beforeEach(async () => {
      // Create test submissions for batch operations
      const batch = admin.firestore().batch();
      for (let i = 0; i < 3; i++) {
        const ref = admin.firestore().collection('submissions').doc();
        batch.set(ref, {
          userId: normalUser.uid,
          templateId: 'test-template',
          status: 'completed',
          responses: { q1: `a${i}` },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        batchSubmissionIds.push(ref.id);
      }
      await batch.commit();
    });

    afterEach(async () => {
      // Cleanup batch test submissions
      const batch = admin.firestore().batch();
      batchSubmissionIds.forEach(id => {
        batch.delete(admin.firestore().collection('submissions').doc(id));
      });
      await batch.commit();
      batchSubmissionIds = [];
    });

    it('should archive multiple submissions', async () => {
      const wrapped = testEnv.wrap(batchArchiveSubmissions);
      const result = await wrapped(
        {
          submissionIds: batchSubmissionIds,
          reason: 'Batch archive test'
        },
        { auth: { uid: normalUser.uid } }
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(batchSubmissionIds.length);

      // Verify all submissions are archived
      const snapshots = await Promise.all(
        batchSubmissionIds.map(id =>
          admin.firestore().collection('submissions').doc(id).get()
        )
      );

      snapshots.forEach(doc => {
        expect(doc.data()?.status).toBe('archived');
        expect(doc.data()?.archiveReason).toBe('Batch archive test');
      });
    });

    it('should validate batch size limit', async () => {
      const wrapped = testEnv.wrap(batchArchiveSubmissions);
      const tooManyIds = Array(501).fill(batchSubmissionIds[0]);

      await expect(
        wrapped(
          { submissionIds: tooManyIds },
          { auth: { uid: normalUser.uid } }
        )
      ).rejects.toThrow(/Cannot archive more than 500 submissions/);
    });
  });
});
