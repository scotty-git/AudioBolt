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

// Define missing composite indexes
const missingIndexes = [
  // Templates Collection - Complex filtering
  {
    collectionId: 'templates',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'type', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Onboarding Submissions Collection
  {
    collectionId: 'onboarding_submissions',
    fields: [
      { fieldPath: 'uid', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'onboarding_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },
  
  // Questionnaire Submissions Collection
  {
    collectionId: 'questionnaire_submissions',
    fields: [
      { fieldPath: 'uid', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionId: 'questionnaire_submissions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'completedAt', order: 'DESCENDING' }
    ]
  }
];

// Function to create composite indexes
async function createMissingIndexes() {
  console.log('\nCreating missing indexes...');

  for (const indexConfig of missingIndexes) {
    try {
      const collection = db.collection(indexConfig.collectionId);
      
      // Build the query based on the index configuration
      let query = collection;
      
      // Add where clauses for the first fields
      for (let i = 0; i < indexConfig.fields.length - 1; i++) {
        const field = indexConfig.fields[i];
        query = query.where(field.fieldPath, '>=', '');
      }
      
      // Add orderBy for all fields
      for (const field of indexConfig.fields) {
        query = query.orderBy(field.fieldPath, field.order === 'ASCENDING' ? 'asc' : 'desc');
      }
      
      // Execute query to trigger index creation
      await query.limit(1).get();
      
      console.log(`✅ Index creation triggered for ${indexConfig.collectionId}:`, 
        indexConfig.fields.map(f => `${f.fieldPath} (${f.order})`).join(', '));
    } catch (error) {
      if (error.code === 9 && error.message.includes('missing index')) {
        console.log(`ℹ️  Index creation request sent for ${indexConfig.collectionId}`);
      } else {
        console.error(`❌ Error creating index for ${indexConfig.collectionId}:`, error.message);
      }
    }
  }
}

// Function to verify indexes
async function verifyIndexes() {
  console.log('\nVerifying indexes...');

  for (const indexConfig of missingIndexes) {
    try {
      const collection = db.collection(indexConfig.collectionId);
      
      // Build the query based on the index configuration
      let query = collection;
      
      // Add where clauses for the first fields
      for (let i = 0; i < indexConfig.fields.length - 1; i++) {
        const field = indexConfig.fields[i];
        query = query.where(field.fieldPath, '>=', '');
      }
      
      // Add orderBy for all fields
      for (const field of indexConfig.fields) {
        query = query.orderBy(field.fieldPath, field.order === 'ASCENDING' ? 'asc' : 'desc');
      }
      
      // Execute query to verify index
      await query.limit(1).get();
      
      console.log(`✅ Index verified for ${indexConfig.collectionId}:`, 
        indexConfig.fields.map(f => `${f.fieldPath} (${f.order})`).join(', '));
    } catch (error) {
      console.error(`❌ Index verification failed for ${indexConfig.collectionId}:`, error.message);
    }
  }
}

// Main function
async function main() {
  try {
    await createMissingIndexes();
    console.log('\nWaiting for indexes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    await verifyIndexes();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
