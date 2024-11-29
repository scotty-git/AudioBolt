import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../src/lib/firebase/config';
import { templateValidationService } from '../src/lib/firebase/templateValidation';
import { COLLECTIONS } from '../src/lib/firebase/collections';

// Test scenarios
const testTemplateValidation = async () => {
  console.log('\n🔬 Template Validation Test Suite');
  console.log('=' .repeat(50));

  // Test Case 1: Valid Template
  try {
    console.log('\n🧪 Test 1: Valid Template Creation');
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

    // Validate and prepare template
    const preparedTemplate = await templateValidationService.validateAndPrepareTemplate(validTemplate);
    
    // Add to Firestore
    const templateRef = await addDoc(
      collection(db, COLLECTIONS.TEMPLATES), 
      preparedTemplate
    );

    console.log('✅ Valid template added successfully');
    console.log(`Template ID: ${templateRef.id}`);
  } catch (error) {
    console.error('❌ Valid template test failed:', error);
  }

  // Test Case 2: Invalid Category
  try {
    console.log('\n🧪 Test 2: Invalid Category Template');
    const invalidCategoryTemplate = {
      title: 'Invalid Category Template',
      description: 'This template should fail validation',
      category_id: 'non_existent_category',
      is_default: false,
      version: '1.0.0',
      content: {
        type: 'questionnaire',
        sections: []
      }
    };

    await templateValidationService.validateAndPrepareTemplate(invalidCategoryTemplate);
    console.error('❌ Invalid category template was unexpectedly added');
  } catch (error) {
    console.log('✅ Prevented template with invalid category');
    console.log('Error:', (error as Error).message);
  }

  // Test Case 3: Multiple Default Templates
  try {
    console.log('\n🧪 Test 3: Multiple Default Templates');
    const firstDefaultTemplate = {
      title: 'First Default Questionnaire',
      description: 'First default template',
      category_id: 'questionnaire',
      is_default: true,
      version: '1.0.0',
      content: {
        type: 'questionnaire',
        sections: [
          {
            title: 'Default Section',
            fields: [
              {
                id: 'test_field',
                type: 'text',
                validation: { required: true }
              }
            ]
          }
        ]
      }
    };

    const secondDefaultTemplate = {
      ...firstDefaultTemplate,
      title: 'Second Default Questionnaire'
    };

    // Add first default template
    await templateValidationService.validateAndPrepareTemplate(firstDefaultTemplate);
    
    // Try to add second default template (should fail)
    await templateValidationService.validateAndPrepareTemplate(secondDefaultTemplate);
    
    console.error('❌ Multiple default templates were unexpectedly added');
  } catch (error) {
    console.log('✅ Prevented multiple default templates in same category');
    console.log('Error:', (error as Error).message);
  }

  // Test Case 4: Missing Required Fields
  try {
    console.log('\n🧪 Test 4: Missing Required Fields');
    const incompleteTemplate = {
      title: 'Incomplete Template',
      // Missing description, category_id, content
      version: '1.0.0'
    };

    await templateValidationService.validateAndPrepareTemplate(incompleteTemplate);
    console.error('❌ Incomplete template was unexpectedly added');
  } catch (error) {
    console.log('✅ Prevented template with missing required fields');
    console.log('Error:', (error as Error).message);
  }
};

// Run the test suite
testTemplateValidation();
