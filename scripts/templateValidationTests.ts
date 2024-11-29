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

// Utility function to validate category
const validateCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const categoryRef = doc(db, COLLECTIONS.TEMPLATE_CATEGORIES, categoryId);
    const categorySnapshot = await getDocs(query(collection(db, COLLECTIONS.TEMPLATE_CATEGORIES), where('id', '==', categoryId)));
    
    return !categorySnapshot.empty;
  } catch (error) {
    console.error('Category validation error:', error);
    return false;
  }
};

// Utility function to check default template count in a category
const checkDefaultTemplateCount = async (categoryId: string): Promise<number> => {
  try {
    const templatesQuery = query(
      collection(db, COLLECTIONS.TEMPLATES), 
      where('category_id', '==', categoryId),
      where('is_default', '==', true)
    );
    const templatesSnapshot = await getDocs(templatesQuery);
    
    return templatesSnapshot.size;
  } catch (error) {
    console.error('Default template count error:', error);
    return 0;
  }
};

// Test 1: Adding a template with a valid category
const testAddValidTemplate = async () => {
  console.log('\n🧪 Test 1: Adding Template with Valid Category');
  console.log('=' .repeat(50));
  
  try {
    const categoryId = 'questionnaire';
    const isValidCategory = await validateCategory(categoryId);
    
    if (!isValidCategory) {
      console.error('❌ Invalid category');
      return false;
    }
    
    const newTemplateRef = doc(collection(db, COLLECTIONS.TEMPLATES));
    await setDoc(newTemplateRef, {
      title: 'Mental Health Assessment',
      description: 'Comprehensive mental health evaluation',
      category_id: categoryId,
      is_default: false,
      version: '1.0.0',
      content: {
        type: 'questionnaire',
        sections: [
          {
            title: 'Emotional Wellbeing',
            fields: [
              {
                id: 'mood',
                type: 'slider',
                validation: { 
                  required: true, 
                  min: 0, 
                  max: 10 
                }
              }
            ]
          }
        ]
      },
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    
    console.log('✅ Valid template added successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to add valid template:', error);
    return false;
  }
};

// Test 2: Attempting to add a template with an invalid category
const testAddInvalidCategoryTemplate = async () => {
  console.log('\n🧪 Test 2: Adding Template with Invalid Category');
  console.log('=' .repeat(50));
  
  try {
    const invalidCategoryId = 'non_existent_category';
    const isValidCategory = await validateCategory(invalidCategoryId);
    
    if (isValidCategory) {
      console.error('❌ Unexpected: Invalid category validated');
      return false;
    }
    
    const newTemplateRef = doc(collection(db, COLLECTIONS.TEMPLATES));
    await setDoc(newTemplateRef, {
      title: 'Invalid Category Template',
      description: 'This template should not be added',
      category_id: invalidCategoryId,
      is_default: false,
      version: '1.0.0',
      content: {}
    });
    
    console.error('❌ Template with invalid category was added unexpectedly');
    return false;
  } catch (error) {
    console.log('✅ Failed to add template with invalid category (expected behavior)');
    return true;
  }
};

// Test 3: Adding multiple default templates in the same category
const testMultipleDefaultTemplates = async () => {
  console.log('\n🧪 Test 3: Adding Multiple Default Templates');
  console.log('=' .repeat(50));
  
  try {
    const categoryId = 'questionnaire';
    const currentDefaultCount = await checkDefaultTemplateCount(categoryId);
    
    // If already 2 or more default templates, skip
    if (currentDefaultCount >= 2) {
      console.log('⚠️  Already has multiple default templates');
      return false;
    }
    
    // Add a second default template
    const newTemplateRef = doc(collection(db, COLLECTIONS.TEMPLATES));
    await setDoc(newTemplateRef, {
      title: 'Second Default Questionnaire',
      description: 'Another default questionnaire template',
      category_id: categoryId,
      is_default: true,
      version: '1.0.0',
      content: {
        type: 'questionnaire',
        sections: [
          {
            title: 'Duplicate Default Test',
            fields: [
              {
                id: 'test_field',
                type: 'text',
                validation: { required: true }
              }
            ]
          }
        ]
      },
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    
    console.error('❌ Multiple default templates added unexpectedly');
    return false;
  } catch (error) {
    console.log('✅ Failed to add multiple default templates (expected behavior)');
    return true;
  }
};

// Run all tests
const runTemplateValidationTests = async () => {
  console.log('\n🔬 Template Validation Test Suite');
  console.log('=' .repeat(50));
  
  const test1Result = await testAddValidTemplate();
  const test2Result = await testAddInvalidCategoryTemplate();
  const test3Result = await testMultipleDefaultTemplates();
  
  console.log('\n📊 Test Results:');
  console.log(`Test 1 (Valid Template): ${test1Result ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Invalid Category): ${test2Result ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Multiple Defaults): ${test3Result ? '✅ PASS' : '❌ FAIL'}`);
  
  process.exit(0);
};

runTemplateValidationTests();
