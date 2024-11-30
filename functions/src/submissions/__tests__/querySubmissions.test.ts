import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';
import { querySubmissions } from '../querySubmissions';

const testEnv = test();

describe('querySubmissions', () => {
  let adminUser: admin.auth.UserRecord;
  let normalUser: admin.auth.UserRecord;
  let testSubmissions: any[];

  beforeAll(async () => {
    // Initialize test users
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

    // Create test submissions
    testSubmissions = [
      {
        userId: normalUser.uid,
        templateId: 'template1',
        status: 'completed',
        responses: { q1: 'a1' },
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        userId: normalUser.uid,
        templateId: 'template1',
        status: 'in_progress',
        responses: { q1: 'a2' },
        createdAt: new Date(Date.now() - 1000)
      },
      {
        userId: 'other-user',
        templateId: 'template2',
        status: 'completed',
        responses: { q1: 'a3' },
        completedAt: new Date(Date.now() - 2000),
        createdAt: new Date(Date.now() - 2000)
      }
    ];

    // Add submissions to Firestore
    const batch = admin.firestore().batch();
    for (const submission of testSubmissions) {
      const ref = admin.firestore().collection('submissions').doc();
      batch.set(ref, submission);
    }
    await batch.commit();
  });

  afterAll(async () => {
    // Cleanup test data
    await Promise.all([
      admin.auth().deleteUser(adminUser.uid),
      admin.auth().deleteUser(normalUser.uid)
    ]);
    testEnv.cleanup();
  });

  it('should require authentication', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    await expect(wrapped({}, { auth: null })).rejects.toThrow(/Must be authenticated/);
  });

  it('should allow users to query their own submissions', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const result = await wrapped(
      { userId: normalUser.uid },
      { auth: { uid: normalUser.uid } }
    );

    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every(s => s.userId === normalUser.uid)).toBe(true);
  });

  it('should not allow users to query other users submissions', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    await expect(
      wrapped(
        { userId: 'other-user' },
        { auth: { uid: normalUser.uid } }
      )
    ).rejects.toThrow(/Can only query your own submissions/);
  });

  it('should allow admins to query all submissions', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const result = await wrapped(
      {},
      { auth: { uid: adminUser.uid } }
    );

    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBeDefined();
  });

  it('should filter by status correctly', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const result = await wrapped(
      {
        userId: normalUser.uid,
        status: 'completed'
      },
      { auth: { uid: normalUser.uid } }
    );

    expect(result.items).toBeDefined();
    expect(result.items.every(s => s.status === 'completed')).toBe(true);
  });

  it('should handle pagination correctly', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const firstPage = await wrapped(
      {
        userId: normalUser.uid,
        pageSize: 1
      },
      { auth: { uid: normalUser.uid } }
    );

    expect(firstPage.items).toHaveLength(1);
    expect(firstPage.nextPageToken).toBeDefined();

    const secondPage = await wrapped(
      {
        userId: normalUser.uid,
        pageSize: 1,
        pageToken: firstPage.nextPageToken
      },
      { auth: { uid: normalUser.uid } }
    );

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.items[0].id).not.toBe(firstPage.items[0].id);
  });

  it('should sort by completedAt desc by default', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const result = await wrapped(
      { userId: normalUser.uid },
      { auth: { uid: normalUser.uid } }
    );

    const completedSubmissions = result.items.filter(s => s.completedAt);
    for (let i = 1; i < completedSubmissions.length; i++) {
      expect(new Date(completedSubmissions[i-1].completedAt).getTime())
        .toBeGreaterThanOrEqual(new Date(completedSubmissions[i].completedAt).getTime());
    }
  });

  it('should handle custom sort options', async () => {
    const wrapped = testEnv.wrap(querySubmissions);
    const result = await wrapped(
      {
        userId: normalUser.uid,
        sortField: 'createdAt',
        sortDirection: 'asc'
      },
      { auth: { uid: normalUser.uid } }
    );

    for (let i = 1; i < result.items.length; i++) {
      expect(new Date(result.items[i-1].createdAt).getTime())
        .toBeLessThanOrEqual(new Date(result.items[i].createdAt).getTime());
    }
  });
});
