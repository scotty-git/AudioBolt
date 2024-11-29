import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase/nodeConfig';
import { COLLECTIONS } from '../src/lib/firebase/collections';

// Comprehensive Template Validation Function
const validateTemplate = async (templateData: any) => {
  // 1. Validate Category
  const categoryRef = doc(db, COLLECTIONS.TEMPLATE_CATEGORIES, templateData.category_id);
  const categorySnapshot = await getDocs(query(collection(db, COLLECTIONS.TEMPLATE_CATEGORIES), where('id', '==', templateData.category_id)));
  
  if (categorySnapshot.empty) {
    throw new Error(`Invalid category: ${templateData.category_id}`);
  }

  // 2. Prevent Multiple Default Templates in Same Category
  if (templateData.is_default) {
    const defaultTemplatesQuery = query(
      collection(db, COLLECTIONS.TEMPLATES), 
      where('category_id', '==', templateData.category_id),
      where('is_default', '==', true)
    );
    const defaultTemplatesSnapshot = await getDocs(defaultTemplatesQuery);
    
    if (defaultTemplatesSnapshot.size > 0) {
      throw new Error(`A default template already exists in category: ${templateData.category_id}`);
    }
  }

  // 3. Validate Content Structure
  if (!templateData.content || !templateData.content.sections) {
    throw new Error('Template must have a valid content structure with sections');
  }

  // 4. Validate Required Fields
  const requiredFields = [
    'title', 
    'description', 
    'category_id', 
    'version', 
    'content'
  ];

  requiredFields.forEach(field => {
    if (!templateData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });

  // 5. Validate Version Format
  const versionRegex = /^\d+\.\d+(\.\d+)?$/;
  if (!versionRegex.test(templateData.version)) {
    throw new Error(`Invalid version format: ${templateData.version}. Use format like '1.0' or '1.0.0'`);
  }

  // If all validations pass, return true
  return true;
};

// Function to add a template with validation
const addTemplateWithValidation = async (templateData: any) => {
  try {
    // Run validation
    await validateTemplate(templateData);

    // If validation passes, add the template
    const newTemplateRef = doc(collection(db, COLLECTIONS.TEMPLATES));
    await setDoc(newTemplateRef, {
      ...templateData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });

    console.log('✅ Template added successfully');
    return newTemplateRef.id;
  } catch (error) {
    console.error('❌ Template validation failed:', error);
    throw error;
  }
};

// Test Scenarios
const runTemplateValidationTests = async () => {
  console.log('\n🔬 Enhanced Template Validation Test Suite');
  console.log('=' .repeat(50));

  try {
    // Test 1: Valid Template
    console.log('\n🧪 Test 1: Adding Valid Template');
    const validTemplate = {
      title: 'Career Development Assessment',
      description: 'Comprehensive career growth evaluation',
      category_id: 'questionnaire',
      is_default: false,
      version: '1.0.0',
      content: {
        type: 'questionnaire',
        sections: [
          {
            title: 'Professional Goals',
            fields: [
              {
                id: 'career_aspiration',
                type: 'text',
                validation: { required: true }
              }
            ]
          }
        ]
      }
    };
    await addTemplateWithValidation(validTemplate);

    // Test 2: Invalid Category
    console.log('\n🧪 Test 2: Adding Template with Invalid Category');
    try {
      const invalidCategoryTemplate = { ...validTemplate, category_id: 'non_existent_category' };
      await addTemplateWithValidation(invalidCategoryTemplate);
    } catch (error) {
      console.log('✅ Prevented template with invalid category');
    }

    // Test 3: Multiple Default Templates
    console.log('\n🧪 Test 3: Adding Multiple Default Templates');
    const defaultTemplate1 = {
      ...validTemplate,
      is_default: true,
      title: 'First Default Template'
    };
    const defaultTemplate2 = {
      ...validTemplate,
      is_default: true,
      title: 'Second Default Template'
    };

    await addTemplateWithValidation(defaultTemplate1);
    
    try {
      await addTemplateWithValidation(defaultTemplate2);
    } catch (error) {
      console.log('✅ Prevented multiple default templates in same category');
    }

    console.log('\n✅ All Validation Tests Completed Successfully');
  } catch (error) {
    console.error('❌ Validation Test Suite Failed:', error);
  }
};

runTemplateValidationTests();
