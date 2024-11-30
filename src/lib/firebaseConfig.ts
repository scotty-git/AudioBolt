import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
const enableOfflineSupport = async (db: Firestore) => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('[Firebase] Offline persistence enabled');
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'failed-precondition') {
        // Multiple tabs might be open
        console.warn('[Firebase] Multiple tabs open, offline persistence disabled');
        throw new Error('Offline persistence unavailable: Multiple tabs open');
      } else if (error.name === 'unimplemented') {
        // Browser doesn't support persistence
        console.warn('[Firebase] Browser doesn\'t support persistence');
        throw new Error('Offline persistence not supported in this browser');
      } else {
        console.error('[Firebase] Error enabling offline persistence:', error);
        throw error;
      }
    }
  }
};

// Initialize offline support
enableOfflineSupport(db).catch(error => {
  console.warn('[Firebase] Offline support initialization error:', error.message);
});

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  try {
    return !!app;
  } catch (error) {
    return false;
  }
};