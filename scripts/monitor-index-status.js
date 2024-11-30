import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Test queries that require the new indexes
async function checkIndexStatus() {
  console.log('Checking index status...\n');
  
  const testQueries = [
    {
      name: 'Onboarding Submissions (uid + completedAt)',
      query: () => db.collection('onboarding_submissions')
        .where('uid', '==', 'test-user')
        .orderBy('completedAt', 'desc')
        .limit(1)
        .get()
    },
    {
      name: 'Questionnaire Submissions (uid + completedAt)',
      query: () => db.collection('questionnaire_submissions')
        .where('uid', '==', 'test-user')
        .orderBy('completedAt', 'desc')
        .limit(1)
        .get()
    }
  ];

  for (const test of testQueries) {
    try {
      console.log(`Testing ${test.name}...`);
      await test.query();
      console.log('✅ Index is ready and working\n');
    } catch (error) {
      if (error.code === 9) {
        console.log('❌ Index is not ready yet (still building)\n');
      } else {
        console.log('❌ Error:', error.message, '\n');
      }
    }
  }
}

// Run the check
checkIndexStatus().finally(() => process.exit());
