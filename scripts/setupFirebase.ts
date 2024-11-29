import { config } from 'dotenv';
import { join } from 'path';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase/config';
import { defaultOnboardingFlow } from '../src/data/defaultOnboardingFlow';
import { defaultQuestionnaires } from '../src/data/defaultQuestionnaires';

// Ensure .env is loaded
config({ path: join(process.cwd(), '.env') });

// Debug: Check if environment variables are loaded
console.log('Checking environment variables:');
console.log('API Key:', process.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('Project ID:', process.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('Messaging Sender ID:', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing');
console.log('App ID:', process.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing');

const COLLECTIONS = {
  TEMPLATES: 'templates',
  ONBOARDING_SUBMISSIONS: 'onboarding_submissions',
  QUESTIONNAIRE_SUBMISSIONS: 'questionnaire_submissions',
};

const setupDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // Create default onboarding template
    const onboardingDoc = doc(collection(db, COLLECTIONS.TEMPLATES));
    batch.set(onboardingDoc, {
      id: onboardingDoc.id,
      type: 'onboarding',
      title: defaultOnboardingFlow.title,
      description: defaultOnboardingFlow.description,
      content: defaultOnboardingFlow,
      version: '1.0.0',
      is_default: true,
      created_at: new Date(),
      updated_at: new Date(),
      status: 'published'
    });

    // Create default questionnaire templates
    for (const questionnaire of defaultQuestionnaires) {
      const questionnaireDoc = doc(collection(db, COLLECTIONS.TEMPLATES));
      batch.set(questionnaireDoc, {
        id: questionnaireDoc.id,
        type: 'questionnaire',
        title: questionnaire.title,
        description: questionnaire.description,
        content: questionnaire,
        version: '1.0.0',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'published'
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};

const init = async () => {
  try {
    console.log('\nSetting up Firebase database...');
    await setupDatabase();
    console.log('✅ Database setup complete!');
    console.log('- Default onboarding template created');
    console.log('- Default questionnaire templates created');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
};

init();
