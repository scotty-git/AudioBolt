import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from './constants';

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  try {
    return !!app && !!db && !!auth;
  } catch (error) {
    return false;
  }
};