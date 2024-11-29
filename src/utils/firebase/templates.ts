import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { v4 as uuidv4 } from 'uuid';

export const addTestTemplate = async () => {
  try {
    const templatesRef = collection(db, 'templates');
    const templateId = uuidv4();
    const now = new Date().toISOString();

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
    console.log('Template added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding template:', error);
    throw error;
  }
};