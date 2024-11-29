import { config } from 'dotenv';
import { join } from 'path';
import { firebaseConfig } from '../src/lib/firebase/core/config';
import { isFirebaseInitialized } from '../src/lib/firebase/core/services';

// Ensure .env is loaded before anything else
config({ path: join(process.cwd(), '.env') });

const checkConfig = async () => {
  try {
    console.log('\nChecking Firebase configuration...\n');

    const configItems = [
      { key: 'apiKey', label: 'API Key' },
      { key: 'projectId', label: 'Project ID' },
      { key: 'messagingSenderId', label: 'Messaging Sender ID' },
      { key: 'appId', label: 'App ID' },
    ];

    let hasErrors = false;
    configItems.forEach(({ key, label }) => {
      const value = firebaseConfig[key as keyof typeof firebaseConfig];
      console.log(`${label}: ${value ? '✓ Set' : '✗ Missing'}`);
      if (!value) hasErrors = true;
    });

    if (hasErrors) {
      console.log('\nEnvironment Variables:');
      console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
      console.log('VITE_FIREBASE_PROJECT_ID:', process.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
      console.log('VITE_FIREBASE_MESSAGING_SENDER_ID:', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing');
      console.log('VITE_FIREBASE_APP_ID:', process.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing');
      
      console.log('\nTo set up Firebase:');
      console.log('1. Create a Firebase project at https://console.firebase.google.com');
      console.log('2. Copy your Firebase config values');
      console.log('3. Add them to your .env file\n');
      process.exit(1);
    }

    const isInitialized = isFirebaseInitialized();
    console.log(`\nFirebase Initialization: ${isInitialized ? '✓ Success' : '✗ Failed'}`);

    process.exit(isInitialized ? 0 : 1);
  } catch (error) {
    console.error('\nError checking Firebase configuration:', error);
    process.exit(1);
  }
};

checkConfig();