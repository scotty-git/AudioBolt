import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TEMPLATES_TO_KEEP = [
  'f11b786e',
  'f11b786e', 
  'fb7b547c',
  'e91f4a60'
];

const DB_PATH = join(process.cwd(), 'local.db');

export const runCleanup = async () => {
  try {
    // Read the database file
    const data = readFileSync(DB_PATH, 'utf-8');
    const templates = JSON.parse(data).templates || [];
    
    console.log(`Found ${templates.length} total templates`);
    
    // Filter templates
    const filteredTemplates = templates.filter(template => 
      TEMPLATES_TO_KEEP.includes(template.id)
    );
    
    console.log(`Keeping ${filteredTemplates.length} templates`);
    
    // Write back to database
    const newData = {
      ...JSON.parse(data),
      templates: filteredTemplates
    };
    
    writeFileSync(DB_PATH, JSON.stringify(newData, null, 2));
    
    console.log('Cleanup completed successfully');
    return true;
  } catch (error) {
    console.error('Cleanup failed:', error);
    return false;
  }
};