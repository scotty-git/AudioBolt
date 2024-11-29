import { config } from 'dotenv';
import { join } from 'path';
import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  Timestamp,
  addDoc 
} from 'firebase/firestore';
import { db } from './firebase/nodeConfig';
import { COLLECTIONS } from '../src/lib/firebase/collections';

import { defaultOnboardingFlow } from '../src/data/defaultOnboardingFlow';
import { defaultQuestionnaires } from '../src/data/defaultQuestionnaires';

// Load environment variables
config({ path: join(process.cwd(), '.env') });

// Utility function to create timestamp
const createTimestamp = () => Timestamp.now();

const setupTemplateCategories = async (batch: any) => {
  const categories = [
    { 
      id: 'onboarding', 
      name: 'Onboarding Flows', 
      description: 'Initial user setup and orientation templates',
      created_at: createTimestamp(),
      updated_at: createTimestamp()
    },
    { 
      id: 'questionnaire', 
      name: 'User Questionnaires', 
      description: 'Detailed user information gathering templates',
      created_at: createTimestamp(),
      updated_at: createTimestamp()
    }
  ];

  for (const category of categories) {
    const categoryRef = doc(collection(db, COLLECTIONS.TEMPLATE_CATEGORIES), category.id);
    batch.set(categoryRef, category);
  }
};

const setupTemplates = async (batch: any) => {
  // Create default onboarding template
  const onboardingDoc = doc(collection(db, COLLECTIONS.TEMPLATES));
  batch.set(onboardingDoc, {
    id: onboardingDoc.id,
    category_id: 'onboarding',
    type: 'onboarding',
    title: defaultOnboardingFlow.title,
    description: defaultOnboardingFlow.description,
    content: defaultOnboardingFlow,
    version: '1.0.0',
    is_default: true,
    created_at: createTimestamp(),
    updated_at: createTimestamp(),
    status: 'published'
  });

  // Create default questionnaire templates
  for (const questionnaire of defaultQuestionnaires) {
    const questionnaireDoc = doc(collection(db, COLLECTIONS.TEMPLATES));
    batch.set(questionnaireDoc, {
      id: questionnaireDoc.id,
      category_id: 'questionnaire',
      type: 'questionnaire',
      title: questionnaire.title,
      description: questionnaire.description,
      content: questionnaire,
      version: '1.0.0',
      is_default: questionnaire.isDefault || false,
      created_at: createTimestamp(),
      updated_at: createTimestamp(),
      status: 'published'
    });
  }
};

const setupDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // Setup template categories
    await setupTemplateCategories(batch);

    // Setup templates
    await setupTemplates(batch);

    // Commit all batched writes
    await batch.commit();

    console.log('🚀 Firebase Database Setup Complete:');
    console.log('- Template Categories Created');
    console.log('- Default Templates Initialized');
  } catch (error) {
    console.error('❌ Database Setup Failed:', error);
    throw error;
  }
};

const init = async () => {
  try {
    console.log('\n🔧 Initializing Firebase Database...');
    await setupDatabase();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database Initialization Failed:', error);
    process.exit(1);
  }
};

init();
