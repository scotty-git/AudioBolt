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

async function testIndexes() {
  console.log('Testing Firestore Indexes...\n');

  // Test users indexes
  console.log('Testing users collection indexes:');
  try {
    const usersByEmail = await db.collection('users')
      .orderBy('email')
      .limit(5)
      .get();
    console.log('✅ Users by email index working');
    
    const usersByCreation = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Users by creation index working');
    
    const usersByLastLogin = await db.collection('users')
      .orderBy('lastLoginAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Users by lastLogin index working');
  } catch (error) {
    console.error('❌ Error testing users indexes:', error.message);
  }

  // Test templates indexes
  console.log('\nTesting templates collection indexes:');
  try {
    const templatesByType = await db.collection('templates')
      .orderBy('type')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Templates by type index working');
    
    const templatesByStatus = await db.collection('templates')
      .orderBy('status')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Templates by status index working');
  } catch (error) {
    console.error('❌ Error testing templates indexes:', error.message);
  }

  // Test user_sessions indexes
  console.log('\nTesting user_sessions collection indexes:');
  try {
    const sessionsByUser = await db.collection('user_sessions')
      .where('userId', '==', 'test-user')
      .orderBy('lastActive', 'desc')
      .limit(5)
      .get();
    console.log('✅ Sessions by user index working');
    
    const sessionsByStatus = await db.collection('user_sessions')
      .where('status', '==', 'active')
      .orderBy('lastActive', 'desc')
      .limit(5)
      .get();
    console.log('✅ Sessions by status index working');
  } catch (error) {
    console.error('❌ Error testing user_sessions indexes:', error.message);
  }

  // Test submissions indexes
  console.log('\nTesting submissions collections indexes:');
  try {
    const onboardingByUser = await db.collection('onboarding_submissions')
      .where('userId', '==', 'test-user')
      .orderBy('completedAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Onboarding submissions by user index working');
    
    const questionnaireByUser = await db.collection('questionnaire_submissions')
      .where('userId', '==', 'test-user')
      .orderBy('completedAt', 'desc')
      .limit(5)
      .get();
    console.log('✅ Questionnaire submissions by user index working');
  } catch (error) {
    console.error('❌ Error testing submissions indexes:', error.message);
  }
}

testIndexes();
