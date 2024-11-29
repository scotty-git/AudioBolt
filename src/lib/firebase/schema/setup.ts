import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { defaultOnboardingFlow } from '../../../data/defaultOnboardingFlow';
import { defaultQuestionnaires } from '../../../data/defaultQuestionnaires';

export const setupDatabase = async () => {
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
        is_default: questionnaire.isDefault,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'published'
      });
    }

    await batch.commit();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};