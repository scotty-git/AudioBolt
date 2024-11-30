import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration using Vite's import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config function
const validateConfig = (config: Record<string, string | undefined>) => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    (field) => !config[field]
  );

  if (missingFields.length > 0) {
    console.warn(
      '[Firebase] Warning: Missing required fields:',
      missingFields.join(', '),
      'Using fallback values.'
    );
  }
};

// Validate the config
validateConfig(firebaseConfig);

console.log('[Firebase] Starting initialization...');

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    console.log('[Firebase] Creating new Firebase instance...');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('[Firebase] Initialization successful');
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    throw error;
  }
} else {
  console.log('[Firebase] Using existing Firebase instance');
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Function to check if Firebase is initialized
const isFirebaseInitialized = () => {
  return getApps().length > 0;
};

export { app, auth, db, storage };