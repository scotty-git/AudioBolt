import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as test from 'firebase-functions-test';
import { createSubmission } from '../createSubmission';

const testEnv = test();
const db = getFirestore();

describe('createSubmission', () => {
  let adminUser: admin.auth.UserRecord;
  let normalUser: admin.auth.UserRecord;
  let templateId: string;

  beforeAll(async () => {
    // Create test users
    adminUser = await getAuth().createUser({
      email: 'admin@test.com',
      password: 'password123'
    });
    await db.collection('users').doc(adminUser.uid).set({
      role: 'admin',
      email: adminUser.email
    });

    normalUser = await getAuth().createUser({
      email: 'user@test.com',
      password: 'password123'
    });
    await db.collection('users').doc(normalUser.uid).set({
      role: 'user',
      email: normalUser.email
    });

    // Create test template
    const templateRef = db.collection('templates').doc();
    await templateRef.set({
      title: 'Test Template',
      type: 'questionnaire',
      status: 'active'
    });
    templateId = templateRef.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await Promise.all([
      getAuth().deleteUser(adminUser.uid),
      getAuth().deleteUser(normalUser.uid),
      db.collection('templates').doc(templateId).delete(),
      db.collection('users').doc(adminUser.uid).delete(),
      db.collection('users').doc(normalUser.uid).delete()
    ]);
    testEnv.cleanup();
  });

  it('should create a submission for authenticated user', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: normalUser.uid,
        token: {}
      }
    };

    const data = {
      userId: normalUser.uid,
      templateId,
      responses: { question1: 'answer1' }
    };

    const result = await wrapped(data, context);
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();

    // Verify submission was created
    const submission = await db.collection('submissions').doc(result.id).get();
    expect(submission.exists).toBe(true);
    expect(submission.data()).toMatchObject({
      userId: normalUser.uid,
      templateId,
      status: 'in_progress'
    });
  });

  it('should allow admin to create submission for other users', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: adminUser.uid,
        token: {}
      }
    };

    const data = {
      userId: normalUser.uid,
      templateId,
      responses: { question1: 'answer1' }
    };

    const result = await wrapped(data, context);
    expect(result.success).toBe(true);
  });

  it('should not allow non-admin to create submission for others', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: normalUser.uid,
        token: {}
      }
    };

    const data = {
      userId: adminUser.uid, // Trying to create for another user
      templateId,
      responses: { question1: 'answer1' }
    };

    await expect(wrapped(data, context)).rejects.toThrow(/Not authorized/);
  });

  it('should validate required fields', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: normalUser.uid,
        token: {}
      }
    };

    // Missing responses
    const data = {
      userId: normalUser.uid,
      templateId
    };

    await expect(wrapped(data, context)).rejects.toThrow(/responses must be a valid object/);
  });

  it('should validate status values', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: normalUser.uid,
        token: {}
      }
    };

    const data = {
      userId: normalUser.uid,
      templateId,
      responses: { question1: 'answer1' },
      status: 'invalid_status'
    };

    await expect(wrapped(data, context)).rejects.toThrow(/status must be one of/);
  });

  it('should add completedAt when status is completed', async () => {
    const wrapped = testEnv.wrap(createSubmission);
    const context = {
      auth: {
        uid: normalUser.uid,
        token: {}
      }
    };

    const data = {
      userId: normalUser.uid,
      templateId,
      responses: { question1: 'answer1' },
      status: 'completed'
    };

    const result = await wrapped(data, context);
    const submission = await db.collection('submissions').doc(result.id).get();
    expect(submission.data()?.completedAt).toBeDefined();
  });
});
