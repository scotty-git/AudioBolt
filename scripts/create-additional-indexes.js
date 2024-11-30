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

// Define additional composite indexes needed
const additionalIndexes = [
  // Templates - type, status, createdAt
  {
    collectionId: 'templates',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'type', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },

  // Onboarding Submissions - userId, status, completedAt
  {
    collectionId: 'onboarding_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },

  // Questionnaire Submissions - userId, status, completedAt
  {
    collectionId: 'questionnaire_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  }
];

async function createAdditionalIndexes() {
  console.log('Creating additional composite indexes...');

  for (const indexConfig of additionalIndexes) {
    try {
      // Build a query that matches the index configuration
      let query = db.collection(indexConfig.collectionId);
      
      // Add initial where clause to ensure index is created
      query = query.where(indexConfig.fields[0].fieldPath, '>=', '');

      // Add ordering based on index configuration
      indexConfig.fields.forEach(field => {
        query = query.orderBy(
          field.fieldPath, 
          field.order === 'ASCENDING' ? 'asc' : 'desc'
        );
      });

      // Execute a limit query to trigger index creation
      const snapshot = await query.limit(1).get();
      
      console.log(`✅ Index triggered for ${indexConfig.collectionId}: ${
        indexConfig.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ')
      }`);
    } catch (error) {
      console.error(`❌ Error creating index for ${indexConfig.collectionId}:`, error);
    }
  }
}

// Function to verify the additional indexes
async function verifyAdditionalIndexes() {
  console.log('\nVerifying additional indexes...');

  for (const indexConfig of additionalIndexes) {
    try {
      let query = db.collection(indexConfig.collectionId);
      
      // Add conditions and ordering
      indexConfig.fields.forEach((field, index) => {
        if (index === 0) {
          query = query.where(field.fieldPath, '>=', '');
        }
        query = query.orderBy(
          field.fieldPath,
          field.order === 'ASCENDING' ? 'asc' : 'desc'
        );
      });

      await query.limit(1).get();
      console.log(`✅ Index verified for ${indexConfig.collectionId}: ${indexConfig.fields.map(f => f.fieldPath).join(', ')}`);
    } catch (error) {
      console.error(`❌ Index verification failed for ${indexConfig.collectionId}:`, error.message);
    }
  }
}

async function main() {
  try {
    await createAdditionalIndexes();
    console.log('\nWaiting 30 seconds for indexes to be created...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    await verifyAdditionalIndexes();
    console.log('\n✅ Additional indexes setup completed');
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit();
  }
}

main();
