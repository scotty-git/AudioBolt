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

// Define composite indexes
const compositeIndexes = [
  // Templates Collection Indexes
  {
    collectionId: 'templates',
    fields: [
      { fieldPath: 'type', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'templates',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },

  // User Sessions Collection Indexes
  {
    collectionId: 'user_sessions',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'lastActive', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'user_sessions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'lastActive', order: 'DESCENDING' }
    ]
  },

  // Onboarding Submissions Collection Indexes
  {
    collectionId: 'onboarding_submissions',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'onboarding_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },

  // Questionnaire Submissions Collection Indexes
  {
    collectionId: 'questionnaire_submissions',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'questionnaire_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  }
];

async function createCompositeIndexes() {
  console.log('Creating composite indexes...');

  for (const indexConfig of compositeIndexes) {
    try {
      // Create a temporary document to ensure collection exists
      const tempDoc = await db.collection(indexConfig.collectionId).add({
        _temp: true,
        _timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create the composite index
      await admin.firestore().collection(indexConfig.collectionId)
        .where(indexConfig.fields[0].fieldPath, '>=', '')
        .orderBy(indexConfig.fields[0].fieldPath, indexConfig.fields[0].order === 'ASCENDING' ? 'asc' : 'desc')
        .orderBy(indexConfig.fields[1].fieldPath, indexConfig.fields[1].order === 'ASCENDING' ? 'asc' : 'desc')
        .limit(1)
        .get();

      // Clean up temporary document
      await tempDoc.delete();

      console.log(`✅ Created index for ${indexConfig.collectionId}: ${indexConfig.fields.map(f => f.fieldPath).join(', ')}`);
    } catch (error) {
      if (error.code === 9 && error.message.includes('requires an index')) {
        console.log(`🔄 Index creation initiated for ${indexConfig.collectionId}`);
        console.log(`📝 Index URL: ${error.message.split('https://')[1]}`);
      } else {
        console.error(`❌ Error creating index for ${indexConfig.collectionId}:`, error);
      }
    }
  }
}

// Function to verify indexes
async function verifyIndexes() {
  console.log('\nVerifying indexes...');

  for (const indexConfig of compositeIndexes) {
    try {
      const result = await db.collection(indexConfig.collectionId)
        .where(indexConfig.fields[0].fieldPath, '>=', '')
        .orderBy(indexConfig.fields[0].fieldPath, indexConfig.fields[0].order === 'ASCENDING' ? 'asc' : 'desc')
        .orderBy(indexConfig.fields[1].fieldPath, indexConfig.fields[1].order === 'ASCENDING' ? 'asc' : 'desc')
        .limit(1)
        .get();

      console.log(`✅ Index verified for ${indexConfig.collectionId}: ${indexConfig.fields.map(f => f.fieldPath).join(', ')}`);
    } catch (error) {
      console.error(`❌ Index verification failed for ${indexConfig.collectionId}:`, error.message);
    }
  }
}

async function main() {
  try {
    await createCompositeIndexes();
    console.log('\nWaiting 30 seconds for indexes to be created...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    await verifyIndexes();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
