import { templateStorage } from '../src/lib/db/templateStorage';

const run = async () => {
  try {
    console.log('\nAdding test template...');
    
    const templateId = await templateStorage.addTestTemplate();
    
    console.log('\n✅ Test template added successfully!');
    console.log('Template ID:', templateId);

    // Verify the template was added
    const templates = await templateStorage.getAllTemplates();
    console.log('\nCurrent templates:', templates.length);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to add test template:', error);
    process.exit(1);
  }
};

run();