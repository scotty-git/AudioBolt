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

// Test queries that require the indexes
const testQueries = [
  {
    name: 'Templates (type, status, createdAt)',
    query: () => db.collection('templates')
      .where('status', '==', 'active')
      .where('type', '==', 'onboarding')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()
  },
  {
    name: 'Onboarding Submissions (status, userId, completedAt)',
    query: () => db.collection('onboarding_submissions')
      .where('status', '==', 'completed')
      .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get()
  },
  {
    name: 'Questionnaire Submissions (status, userId, completedAt)',
    query: () => db.collection('questionnaire_submissions')
      .where('status', '==', 'completed')
      .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get()
  }
];

async function checkIndexes() {
  console.log('\nChecking index status...');
  console.log('------------------------');

  let allIndexesReady = true;

  for (const testQuery of testQueries) {
    try {
      await testQuery.query();
      console.log(`✅ ${testQuery.name}: Index is ready`);
    } catch (error) {
      allIndexesReady = false;
      if (error.code === 9 && error.message.includes('requires an index')) {
        console.log(`⏳ ${testQuery.name}: Index still building`);
      } else {
        console.error(`❌ ${testQuery.name}: Error:`, error.message);
      }
    }
  }

  return allIndexesReady;
}

async function monitorIndexes(maxAttempts = 12, delaySeconds = 30) {
  console.log('🔍 Starting index monitoring');
  console.log(`Will check every ${delaySeconds} seconds, up to ${maxAttempts} times`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n📊 Attempt ${attempt}/${maxAttempts}`);
    
    const indexesReady = await checkIndexes();
    
    if (indexesReady) {
      console.log('\n✅ All indexes are ready!');
      return true;
    }

    if (attempt < maxAttempts) {
      console.log(`\nWaiting ${delaySeconds} seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
  }

  console.log('\n⚠️ Maximum attempts reached. Some indexes might still be building.');
  return false;
}

// Start monitoring
monitorIndexes()
  .then(success => {
    if (success) {
      console.log('\n🎉 Index monitoring completed successfully');
    } else {
      console.log('\n⚠️ Index monitoring timed out');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error during monitoring:', error);
    process.exit(1);
  });
