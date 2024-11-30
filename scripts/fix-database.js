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

async function fixTemplates() {
  console.log('\nFixing templates collection...');
  const templatesRef = db.collection('templates');
  const snapshot = await templatesRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      type: data.type || 'default',
      status: data.status || 'draft',
      content: typeof data.content === 'object' ? JSON.stringify(data.content) : data.content
    };

    await doc.ref.update(updates);
    console.log(`✅ Fixed template: ${doc.id}`);
  }
}

async function createSampleData() {
  console.log('\nCreating sample data...');
  
  // Create a sample user
  const userData = {
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    isAdmin: false
  };
  
  const userRef = await db.collection('users').add(userData);
  console.log(`✅ Created sample user: ${userRef.id}`);

  // Create user profile
  const profileData = {
    userId: userRef.id,
    bio: 'Test bio',
    preferences: {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('user_profiles').doc(userRef.id).set(profileData);
  console.log('✅ Created sample user profile');

  // Create sample session
  const sessionData = {
    userId: userRef.id,
    status: 'active',
    lastActive: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('user_sessions').add(sessionData);
  console.log('✅ Created sample user session');

  // Create sample submissions
  const submissionData = {
    userId: userRef.id,
    responses: { question1: 'answer1' },
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('onboarding_submissions').add(submissionData);
  await db.collection('questionnaire_submissions').add(submissionData);
  console.log('✅ Created sample submissions');
}

async function createIndexes() {
  console.log('\nCreating required indexes...');
  
  const indexes = [
    {
      collectionGroup: 'templates',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'user_sessions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'lastActive', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'onboarding_submissions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'completedAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'questionnaire_submissions',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'completedAt', order: 'DESCENDING' }
      ]
    }
  ];

  for (const index of indexes) {
    try {
      await admin.firestore().collection(index.collectionGroup).doc().collection('_').doc()
        .set({ dummy: true });
      console.log(`✅ Created index for ${index.collectionGroup}`);
    } catch (error) {
      console.error(`❌ Error creating index for ${index.collectionGroup}:`, error);
    }
  }
}

async function main() {
  try {
    await fixTemplates();
    await createSampleData();
    await createIndexes();
    console.log('\n✅ Database fixes completed successfully');
  } catch (error) {
    console.error('\n❌ Error fixing database:', error);
  } finally {
    process.exit();
  }
}

main();
