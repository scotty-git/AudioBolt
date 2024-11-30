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

// Helper function to measure query execution time
async function measureQueryPerformance(name, queryFn) {
  console.log(`\nTesting query: ${name}`);
  console.log('----------------------------------------');
  
  const start = Date.now();
  try {
    const snapshot = await queryFn();
    const end = Date.now();
    const duration = end - start;

    console.log(`✅ Query completed in ${duration}ms`);
    console.log(`Documents returned: ${snapshot.size}`);
    
    // Log first document as sample (if exists)
    if (!snapshot.empty) {
      console.log('\nSample document:');
      console.log(JSON.stringify(snapshot.docs[0].data(), null, 2));
    }

    return { success: true, duration, size: snapshot.size };
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    if (error.message.includes('requires an index')) {
      console.log('Index required:', error.message.split('https://')[1]);
    }
    return { success: false, error: error.message };
  }
}

async function testQueries() {
  // Test 1: Recent Users Query
  await measureQueryPerformance(
    'Recent Users (by createdAt)',
    () => db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
  );

  // Test 2: Templates by Type and Status
  await measureQueryPerformance(
    'Templates (by type, status, createdAt)',
    () => db.collection('templates')
      .where('type', '==', 'onboarding')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
  );

  // Test 3: User's Completed Submissions
  const testUserId = '8Tg5lc3CEDYzFmUZ8xvo'; // Using the sample user ID we created earlier
  
  await measureQueryPerformance(
    'Onboarding Submissions (by user, completedAt)',
    () => db.collection('onboarding_submissions')
      .where('userId', '==', testUserId)
      .where('status', '==', 'completed')
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get()
  );

  await measureQueryPerformance(
    'Questionnaire Submissions (by user, completedAt)',
    () => db.collection('questionnaire_submissions')
      .where('userId', '==', testUserId)
      .where('status', '==', 'completed')
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get()
  );
}

// Execute performance tests
console.log('🔍 Starting Query Performance Tests');
console.log('====================================');

testQueries()
  .then(() => {
    console.log('\n✅ Performance testing completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error during performance testing:', error);
    process.exit(1);
  });
