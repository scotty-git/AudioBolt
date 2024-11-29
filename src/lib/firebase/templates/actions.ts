import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../core/services';
import { v4 as uuidv4 } from 'uuid';

export const addTestTemplate = async (): Promise<string> => {
  try {
    const templatesRef = collection(db, 'templates');
    const templateId = uuidv4();
    const now = Timestamp.now();

    const templateData = {
      id: templateId,
      type: 'onboarding',
      title: 'Test Template',
      description: 'A test onboarding template',
      content: JSON.stringify({ question: "What is your goal?" }),
      version: '1.0.0',
      is_default: false,
      status: 'draft',
      category_id: null,
      created_at: now,
      updated_at: now
    };

    const docRef = await addDoc(templatesRef, templateData);
    console.log('\nTemplate created with ID:', docRef.id);
    console.log('Template data:', templateData);
    return docRef.id;
  } catch (error) {
    console.error('\nError adding template:', error);
    throw error;
  }
};