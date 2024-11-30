import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { app } from '../lib/firebaseConfig';

const PROJECT_ID = 'demo-' + Math.random().toString(36).substring(7);

export const setupTestEnvironment = async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
      port: 8080
    }
  });

  // Connect to emulators
  const db = getFirestore(app);
  const auth = getAuth(app);

  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');

  return testEnv;
};

export const cleanupTestEnvironment = async (testEnv: RulesTestEnvironment) => {
  await testEnv.cleanup();
};
