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

async function measureQueryTime(queryFn, name) {
  console.log(`\nTesting: ${name}`);
  console.log('-'.repeat(50));
  
  const start = performance.now();
  try {
    const snapshot = await queryFn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    console.log(`✅ Success`);
    console.log(`📊 Execution time: ${duration}ms`);
    console.log(`📝 Documents returned: ${snapshot.size}`);
    return { success: true, duration, size: snapshot.size };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

const queries = [
  {
    name: 'Templates by type and status, ordered by createdAt',
    fn: () => db.collection('templates')
      .where('type', '==', 'onboarding')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get()
  },
  {
    name: 'Onboarding submissions by status and userId, ordered by completedAt',
    fn: () => db.collection('onboarding_submissions')
      .where('status', '==', 'completed')
      .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
      .orderBy('completedAt', 'desc')
      .get()
  },
  {
    name: 'Questionnaire submissions by status and userId, ordered by completedAt',
    fn: () => db.collection('questionnaire_submissions')
      .where('status', '==', 'completed')
      .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
      .orderBy('completedAt', 'desc')
      .get()
  }
];

async function runTests() {
  console.log('🔍 Starting Index Performance Tests');
  console.log('==================================');

  const results = [];
  
  for (const query of queries) {
    const result = await measureQueryTime(query.fn, query.name);
    results.push({ name: query.name, ...result });
  }

  console.log('\n📊 Summary');
  console.log('==================================');
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.success) {
      console.log(`  Time: ${result.duration}ms`);
      console.log(`  Docs: ${result.size}`);
    } else {
      console.log(`  Failed: ${result.error}`);
    }
  });
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
