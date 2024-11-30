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

async function measureQueryTime(queryFn) {
  const start = process.hrtime();
  const result = await queryFn();
  const [seconds, nanoseconds] = process.hrtime(start);
  const milliseconds = (seconds * 1000) + (nanoseconds / 1000000);
  return {
    time: milliseconds.toFixed(2),
    count: result.size
  };
}

async function runPerformanceTests() {
  console.log('Running performance tests...\n');

  const tests = [
    {
      name: 'Templates (status + type + createdAt)',
      query: () => db.collection('templates')
        .where('status', '==', 'active')
        .where('type', '==', 'onboarding')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
    },
    {
      name: 'Onboarding Submissions (uid + completedAt)',
      query: () => db.collection('onboarding_submissions')
        .where('uid', '==', 'test-user')
        .orderBy('completedAt', 'desc')
        .limit(10)
        .get()
    },
    {
      name: 'Questionnaire Submissions (uid + completedAt)',
      query: () => db.collection('questionnaire_submissions')
        .where('uid', '==', 'test-user')
        .orderBy('completedAt', 'desc')
        .limit(10)
        .get()
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const { time, count } = await measureQueryTime(test.query);
      console.log(`✅ Query executed in ${time}ms`);
      console.log(`📊 Retrieved ${count} documents\n`);
    } catch (error) {
      console.log(`❌ Error:`, error.message, '\n');
    }
  }
}

// Run the tests
runPerformanceTests().finally(() => process.exit());
