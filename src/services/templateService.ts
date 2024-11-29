import { 
  collection, 
  addDoc, 
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { COLLECTIONS } from '../lib/firebase/collections';
import { TemplateFormValues } from '../components/forms/TemplateValidationSchema';
import { validateTemplate } from '../components/forms/TemplateValidationSchema';
import { templateValidationService } from '../lib/firebase/templateValidation';

// Check if a default template already exists in a category
export const checkDefaultTemplateExists = async (categoryId: string): Promise<boolean> => {
  try {
    const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
    const q = query(
      templatesRef, 
      where('category_id', '==', categoryId),
      where('is_default', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking default template:', error);
    throw error;
  }
};

// Comprehensive validation combining client and server-side checks
export const validateTemplateSubmission = async (templateData: TemplateFormValues) => {
  try {
    // 1. Client-side validation (Yup schema)
    await validateTemplate(templateData);

    // 2. Backend validation (Firebase-specific checks)
    const backendValidation = await templateValidationService.validateTemplate(
      // Convert client-side template to backend-compatible format
      {
        ...templateData,
        category_id: templateData.category_id,
        is_default: templateData.is_default || false
      }
    );

    // If backend validation fails, throw detailed error
    if (!backendValidation.isValid) {
      throw new Error(backendValidation.errors.join('; '));
    }

    return true;
  } catch (error) {
    console.error('Comprehensive template validation failed:', error);
    throw error;
  }
};

// Add a new template to Firestore with comprehensive validation
export const addTemplate = async (templateData: TemplateFormValues): Promise<string> => {
  try {
    // Comprehensive validation
    await validateTemplateSubmission(templateData);

    // Check for existing default template if this is set as default
    if (templateData.is_default) {
      const hasExistingDefault = await checkDefaultTemplateExists(templateData.category_id);
      if (hasExistingDefault) {
        throw new Error(`A default template already exists in category: ${templateData.category_id}`);
      }
    }

    // Prepare template for Firestore
    const firestoreTemplate = {
      ...templateData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    // Add to Firestore
    const templateRef = await addDoc(
      collection(db, COLLECTIONS.TEMPLATES), 
      firestoreTemplate
    );

    return templateRef.id;
  } catch (error) {
    console.error('Template creation error:', error);
    throw error;
  }
};

// Fetch templates by category
export const getTemplatesByCategory = async (categoryId: string) => {
  try {
    const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
    const q = query(templatesRef, where('category_id', '==', categoryId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};
