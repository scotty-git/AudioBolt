import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deployRules() {
  try {
    // Read the rules file
    const rules = readFileSync(
      join(__dirname, '..', 'firestore.rules'),
      'utf8'
    );

    // Deploy rules using Admin SDK
    await admin.securityRules().releaseFirestoreRulesetFromSource(rules);
    console.log('✅ Successfully deployed Firestore security rules');
  } catch (error) {
    console.error('❌ Error deploying rules:', error);
    process.exit(1);
  }
}

// Execute deployment
deployRules();
