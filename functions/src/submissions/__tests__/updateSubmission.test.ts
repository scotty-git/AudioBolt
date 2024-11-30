import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';
import { updateSubmission } from '../updateSubmission';
import { Submission } from '../../types/submission';

const testEnv = test();

describe('updateSubmission', () => {
  let adminUser: admin.auth.UserRecord;
  let normalUser: admin.auth.UserRecord;
  let otherUser: admin.auth.UserRecord;
  let testSubmissionId: string;
  let testTemplateId: string;

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

    // Create test template
    const templateRef = admin.firestore().collection('templates').doc();
    await templateRef.set({
      title: 'Test Template',
      type: 'questionnaire'
    });
    testTemplateId = templateRef.id;

    // Create test submission
    const submissionRef = admin.firestore().collection('submissions').doc();
    await submissionRef.set({
      userId: normalUser.uid,
      templateId: testTemplateId,
      status: 'in_progress',
      responses: { q1: 'a1' },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: 1
    });
    testSubmissionId = submissionRef.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await Promise.all([
      admin.auth().deleteUser(adminUser.uid),
      admin.auth().deleteUser(normalUser.uid),
      admin.auth().deleteUser(otherUser.uid),
      admin.firestore().collection('templates').doc(testTemplateId).delete(),
      admin.firestore().collection('submissions').doc(testSubmissionId).delete()
    ]);
    testEnv.cleanup();
  });

  it('should require authentication', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    await expect(
      wrapped({ submissionId: testSubmissionId }, { auth: null })
    ).rejects.toThrow(/Must be authenticated/);
  });

  it('should allow owner to update responses', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    const result = await wrapped(
      {
        submissionId: testSubmissionId,
        responses: { q1: 'updated_answer' }
      },
      { auth: { uid: normalUser.uid } }
    );

    expect(result.success).toBe(true);

    // Verify update
    const doc = await admin.firestore()
      .collection('submissions')
      .doc(testSubmissionId)
      .get();
    expect(doc.data()?.responses.q1).toBe('updated_answer');
  });

  it('should allow valid status transition', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    const result = await wrapped(
      {
        submissionId: testSubmissionId,
        status: 'completed'
      },
      { auth: { uid: normalUser.uid } }
    );

    expect(result.success).toBe(true);

    // Verify update
    const doc = await admin.firestore()
      .collection('submissions')
      .doc(testSubmissionId)
      .get();
    expect(doc.data()?.status).toBe('completed');
    expect(doc.data()?.completedAt).toBeDefined();
  });

  it('should prevent invalid status transition', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    await expect(
      wrapped(
        {
          submissionId: testSubmissionId,
          status: 'in_progress' // Can't go back to in_progress
        },
        { auth: { uid: normalUser.uid } }
      )
    ).rejects.toThrow(/Invalid status transition/);
  });

  it('should prevent non-owner from updating', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    await expect(
      wrapped(
        {
          submissionId: testSubmissionId,
          responses: { q1: 'unauthorized_update' }
        },
        { auth: { uid: otherUser.uid } }
      )
    ).rejects.toThrow(/Not authorized/);
  });

  it('should allow admin to update templateId', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    const newTemplateRef = await admin.firestore().collection('templates').add({
      title: 'New Template',
      type: 'questionnaire'
    });

    const result = await wrapped(
      {
        submissionId: testSubmissionId,
        templateId: newTemplateRef.id
      },
      { auth: { uid: adminUser.uid } }
    );

    expect(result.success).toBe(true);

    // Verify update
    const doc = await admin.firestore()
      .collection('submissions')
      .doc(testSubmissionId)
      .get();
    expect(doc.data()?.templateId).toBe(newTemplateRef.id);

    // Cleanup
    await newTemplateRef.delete();
  });

  it('should prevent non-admin from updating templateId', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    await expect(
      wrapped(
        {
          submissionId: testSubmissionId,
          templateId: 'new-template-id'
        },
        { auth: { uid: normalUser.uid } }
      )
    ).rejects.toThrow(/Only admins can update templateId/);
  });

  it('should create version history', async () => {
    const wrapped = testEnv.wrap(updateSubmission);
    await wrapped(
      {
        submissionId: testSubmissionId,
        responses: { q1: 'versioned_answer' }
      },
      { auth: { uid: normalUser.uid } }
    );

    // Verify version history
    const versions = await admin.firestore()
      .collection('submissions')
      .doc(testSubmissionId)
      .collection('version_history')
      .get();

    expect(versions.empty).toBe(false);
    const lastVersion = versions.docs[versions.docs.length - 1].data();
    expect(lastVersion.changedBy).toBe(normalUser.uid);
    expect(lastVersion.changeType).toBe('responses');
  });
});
