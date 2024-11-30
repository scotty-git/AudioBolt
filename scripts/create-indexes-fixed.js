import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Initialize Firebase Admin with the correct service account path
const serviceAccount = JSON.parse(
  readFileSync('/Users/calsmith/Downloads/audiobook-fdbb4-firebase-adminsdk-sw789-1a72111dc6.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Create the indexes directly using the Admin SDK
async function createIndexes() {
  try {
    // Test queries that will trigger index creation
    const queries = [
      {
        name: 'Templates by type and status',
        collection: 'templates',
        query: async () => {
          await db.collection('templates')
            .where('status', '==', 'active')
            .where('type', '==', 'onboarding')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        }
      },
      {
        name: 'Onboarding submissions by user',
        collection: 'onboarding_submissions',
        query: async () => {
          await db.collection('onboarding_submissions')
            .where('status', '==', 'completed')
            .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
            .orderBy('completedAt', 'desc')
            .limit(1)
            .get();
        }
      },
      {
        name: 'Questionnaire submissions by user',
        collection: 'questionnaire_submissions',
        query: async () => {
          await db.collection('questionnaire_submissions')
            .where('status', '==', 'completed')
            .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
            .orderBy('completedAt', 'desc')
            .limit(1)
            .get();
        }
      }
    ];

    // Try each query and catch the index creation URLs
    for (const { name, query } of queries) {
      try {
        console.log(`\nTesting ${name}...`);
        await query();
        console.log(`✅ Index already exists for ${name}`);
      } catch (error) {
        if (error.code === 9 && error.message.includes('requires an index')) {
          const indexUrl = error.message.split('https://')[1];
          console.log(`⚠️ Index needed for ${name}`);
          console.log(`📝 Create the index here: https://${indexUrl}`);
        } else {
          console.error(`❌ Error testing ${name}:`, error);
        }
      }
    }

    console.log('\n✅ Index creation process completed');
    console.log('Note: Indexes may take a few minutes to become active');
    console.log('Run this script again in 5 minutes to verify all indexes');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

// Run the index creation
createIndexes();
