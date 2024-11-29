import { initializeDatabase } from '../src/db/client.js';
import { templateRepository } from '../src/db/repositories/templateRepository.js';

const TEMPLATES_TO_KEEP = [
  'f11b786e',
  'f11b786e',
  'fb7b547c',
  'e91f4a60'
];

const cleanup = async () => {
  try {
    // Initialize the database
    const db = await initializeDatabase();
    console.log('Database initialized');

    // Get all templates
    const templates = await templateRepository.findAll();
    console.log(`Found ${templates.length} total templates`);

    // Delete templates not in keep list
    for (const template of templates) {
      if (!TEMPLATES_TO_KEEP.includes(template.id)) {
        await templateRepository.delete(template.id);
        console.log(`Deleted template: ${template.id}`);
      } else {
        console.log(`Keeping template: ${template.id}`);
      }
    }

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanup();