import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './app';

export const db = getFirestore(app);
export const auth = getAuth(app);

export const isFirebaseInitialized = () => {
  try {
    return !!app && !!db && !!auth;
  } catch (error) {
    console.error('Firebase initialization check failed:', error);
    return false;
  }
};