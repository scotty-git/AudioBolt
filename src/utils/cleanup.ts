import { initializeDatabase } from '../db/client.js';
import { templateRepository } from '../db/repositories/index.js';

const TEMPLATES_TO_KEEP = [
  'f11b786e',
  'f11b786e', 
  'fb7b547c',
  'e91f4a60'
];

export const cleanupTemplates = async () => {
  try {
    // Initialize the database
    await initializeDatabase();
    console.log('Database initialized');

    // Get all templates
    const templates = await templateRepository.findAll();
    console.log(`Found ${templates.length} total templates`);

    // Delete templates not in keep list
    let deletedCount = 0;
    let keptCount = 0;

    for (const template of templates) {
      if (!TEMPLATES_TO_KEEP.includes(template.id)) {
        await templateRepository.delete(template.id);
        deletedCount++;
        console.log(`Deleted template: ${template.id}`);
      } else {
        keptCount++;
        console.log(`Keeping template: ${template.id}`);
      }
    }

    console.log(`Cleanup completed. Kept ${keptCount} templates, deleted ${deletedCount} templates.`);
    return { keptCount, deletedCount };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
};