import { templateRepository } from '../db/repositories';

export const cleanupTemplates = async (keepIds: string[]) => {
  try {
    const templates = await templateRepository.findAll();
    
    for (const template of templates) {
      // Skip if template ID is in the keep list
      if (keepIds.includes(template.id)) {
        continue;
      }
      
      // Delete all other templates
      await templateRepository.delete(template.id);
    }
    
    console.log('Template cleanup completed successfully');
  } catch (error) {
    console.error('Error during template cleanup:', error);
    throw error;
  }
};