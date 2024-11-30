import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  let adminDb: FirebaseFirestore.Firestore;
  let userContext: RulesTestContext;
  let adminContext: RulesTestContext;
  let unauthedContext: RulesTestContext;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-project',
      firestore: {
        rules: './firestore.rules'
      }
    });

    adminDb = getFirestore();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    
    userContext = testEnv.authenticatedContext('user123', {
      email: 'user@test.com'
    });

    adminContext = testEnv.authenticatedContext('admin123', {
      email: 'admin@test.com',
      isAdmin: true
    });

    unauthedContext = testEnv.unauthenticatedContext();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('User Collection Rules', () => {
    it('prevents unauthorized user creation', async () => {
      const userDoc = userContext.firestore()
        .collection('users')
        .doc('unauthorized');

      await expect(userDoc.set({
        email: 'unauthorized@test.com',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });

    it('prevents email modification by non-owners', async () => {
      const userDoc = adminDb.collection('users').doc('user123');
      await userDoc.set({
        email: 'original@test.com',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      const attackerContext = testEnv.authenticatedContext('attacker');
      await expect(
        attackerContext.firestore()
          .collection('users')
          .doc('user123')
          .update({ email: 'hacked@test.com' })
      ).toBeRejected();
    });

    it('enforces email format validation', async () => {
      const userDoc = userContext.firestore()
        .collection('users')
        .doc('user123');

      await expect(userDoc.set({
        email: 'invalid-email',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });

    it('prevents timestamp tampering', async () => {
      const userDoc = userContext.firestore()
        .collection('users')
        .doc('user123');

      await userDoc.set({
        email: 'user@test.com',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await expect(userDoc.update({
        createdAt: Timestamp.now()
      })).toBeRejected();
    });
  });

  describe('Submission Rules', () => {
    beforeEach(async () => {
      // Set up test data
      await adminDb.collection('users').doc('user123').set({
        email: 'user@test.com',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    });

    it('prevents unauthorized submission access', async () => {
      const submissionDoc = adminDb
        .collection('onboarding_submissions')
        .doc('sub123');

      await submissionDoc.set({
        userId: 'user123',
        responses: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await expect(
        unauthedContext.firestore()
          .collection('onboarding_submissions')
          .doc('sub123')
          .get()
      ).toBeRejected();
    });

    it('enforces user reference validation', async () => {
      const submissionDoc = userContext.firestore()
        .collection('onboarding_submissions')
        .doc('sub123');

      await expect(submissionDoc.set({
        userId: 'non-existent-user',
        responses: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });

    it('prevents cross-user submission access', async () => {
      const submissionDoc = adminDb
        .collection('onboarding_submissions')
        .doc('sub123');

      await submissionDoc.set({
        userId: 'user123',
        responses: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      const otherUserContext = testEnv.authenticatedContext('other-user');
      await expect(
        otherUserContext.firestore()
          .collection('onboarding_submissions')
          .doc('sub123')
          .get()
      ).toBeRejected();
    });
  });

  describe('Template Rules', () => {
    it('prevents non-admin template creation', async () => {
      const templateDoc = userContext.firestore()
        .collection('templates')
        .doc('template123');

      await expect(templateDoc.set({
        content: '{}',
        title: 'Test Template',
        type: 'test',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });

    it('enforces JSON content validation', async () => {
      const templateDoc = adminContext.firestore()
        .collection('templates')
        .doc('template123');

      await expect(templateDoc.set({
        content: 'invalid-json',
        title: 'Test Template',
        type: 'test',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });

    it('prevents content size abuse', async () => {
      const templateDoc = adminContext.firestore()
        .collection('templates')
        .doc('template123');

      const largeContent = '{' + 'x'.repeat(1048577) + '}'; // Exceeds 1MB

      await expect(templateDoc.set({
        content: largeContent,
        title: 'Test Template',
        type: 'test',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })).toBeRejected();
    });
  });

  describe('Edge Cases', () => {
    it('prevents nested object timestamp tampering', async () => {
      const submissionDoc = userContext.firestore()
        .collection('onboarding_submissions')
        .doc('sub123');

      await submissionDoc.set({
        userId: 'user123',
        responses: {
          createdAt: Timestamp.now() // Trying to hide timestamp in nested object
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await expect(submissionDoc.update({
        'responses.createdAt': Timestamp.now()
      })).toBeRejected();
    });

    it('prevents array-based timestamp updates', async () => {
      const userDoc = userContext.firestore()
        .collection('users')
        .doc('user123');

      await userDoc.set({
        email: 'user@test.com',
        timestamps: [Timestamp.now()],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await expect(userDoc.update({
        timestamps: [Timestamp.now()]
      })).toBeRejected();
    });

    it('prevents field deletion bypass', async () => {
      const userDoc = userContext.firestore()
        .collection('users')
        .doc('user123');

      await userDoc.set({
        email: 'user@test.com',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await expect(userDoc.update({
        email: FieldValue.delete()
      })).toBeRejected();
    });
  });

  describe('Rate Limiting Tests', () => {
    it('enforces submission creation rate limits', async () => {
      const promises = Array(61).fill(null).map((_, i) => 
        userContext.firestore()
          .collection('onboarding_submissions')
          .doc(`sub${i}`)
          .set({
            userId: 'user123',
            responses: {},
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          })
      );

      await expect(Promise.all(promises)).toBeRejected();
    });

    it('detects suspicious IP patterns', async () => {
      const suspiciousIPs = Array(10).fill(null).map((_, i) => 
        `192.168.1.${i}`
      );

      for (const ip of suspiciousIPs) {
        await userContext.firestore()
          .collection('onboarding_submissions')
          .doc()
          .set({
            userId: 'user123',
            responses: {},
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          }, { ip });
      }

      const alerts = await adminDb
        .collection('security_alerts')
        .where('type', '==', 'suspicious_rate_limit')
        .get();

      expect(alerts.size).toBeGreaterThan(0);
    });
  });
});
