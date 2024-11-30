import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { google } from 'googleapis';

// Initialize Firebase Admin with the correct service account path
const serviceAccount = JSON.parse(
  readFileSync('/Users/calsmith/Downloads/audiobook-fdbb4-firebase-adminsdk-sw789-1a72111dc6.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createIndexes() {
  try {
    // Create a new JWT client using the service account credentials
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/cloud-platform'],
      null
    );

    // Authenticate the client
    await jwtClient.authorize();

    // Create Firestore API client
    const firestore = google.firestore({
      version: 'v1',
      auth: jwtClient
    });

    // Define the indexes we want to create
    const indexes = [
      // Templates index
      {
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'type', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ],
        queryScope: 'COLLECTION'
      },
      // Onboarding submissions index
      {
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'completedAt', order: 'DESCENDING' }
        ],
        queryScope: 'COLLECTION'
      },
      // Questionnaire submissions index
      {
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'completedAt', order: 'DESCENDING' }
        ],
        queryScope: 'COLLECTION'
      }
    ];

    const collections = ['templates', 'onboarding_submissions', 'questionnaire_submissions'];
    const projectId = serviceAccount.project_id;
    const databaseId = '(default)';

    console.log('Creating indexes...');

    // Create each index using the Firestore API
    for (let i = 0; i < indexes.length; i++) {
      const collection = collections[i];
      const indexConfig = indexes[i];

      try {
        const parent = `projects/${projectId}/databases/${databaseId}/collectionGroups/${collection}`;
        
        await firestore.projects.databases.collectionGroups.indexes.create({
          parent,
          requestBody: indexConfig
        });

        console.log(`✅ Created index for ${collection}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Index for ${collection} already exists`);
        } else {
          console.error(`❌ Error creating index for ${collection}:`, error.message);
        }
      }
    }

    console.log('\n✅ All indexes processed');

    // Wait a bit for indexes to be ready
    console.log('\nWaiting 10 seconds for indexes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify the indexes by running test queries
    console.log('\nVerifying indexes...');
    
    const testQueries = [
      {
        name: 'Templates',
        query: () => db.collection('templates')
          .where('status', '==', 'active')
          .where('type', '==', 'onboarding')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()
      },
      {
        name: 'Onboarding Submissions',
        query: () => db.collection('onboarding_submissions')
          .where('status', '==', 'completed')
          .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
          .orderBy('completedAt', 'desc')
          .limit(1)
          .get()
      },
      {
        name: 'Questionnaire Submissions',
        query: () => db.collection('questionnaire_submissions')
          .where('status', '==', 'completed')
          .where('userId', '==', '8Tg5lc3CEDYzFmUZ8xvo')
          .orderBy('completedAt', 'desc')
          .limit(1)
          .get()
      }
    ];

    for (const { name, query } of testQueries) {
      try {
        await query();
        console.log(`✅ Index verified for ${name}`);
      } catch (error) {
        console.error(`❌ Error verifying index for ${name}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

// Run the index creation
createIndexes();
