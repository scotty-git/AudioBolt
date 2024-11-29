import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/nodeConfig';
import { COLLECTIONS } from '../src/lib/firebase/collections';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  sort_order?: number;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category_id: string;
  is_default: boolean;
  version: string;
}

const fetchTemplatesWithCategories = async () => {
  try {
    // Fetch all categories
    const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.TEMPLATE_CATEGORIES));
    const categories: { [key: string]: TemplateCategory } = {};
    categoriesSnapshot.forEach((doc) => {
      categories[doc.id] = { id: doc.id, ...doc.data() } as TemplateCategory;
    });

    // Fetch all templates
    const templatesSnapshot = await getDocs(collection(db, COLLECTIONS.TEMPLATES));
    
    console.log('\n📊 Templates Analysis Report:\n');
    
    // 1. All templates with category details
    console.log('1. ALL TEMPLATES WITH CATEGORY DETAILS:');
    console.log('=' .repeat(50));
    const templatesWithCategories: { [categoryId: string]: Template[] } = {};
    
    templatesSnapshot.forEach((templateDoc) => {
      const templateData = templateDoc.data() as Template;
      const categoryId = templateData.category_id;
      
      // Group templates by category
      if (!templatesWithCategories[categoryId]) {
        templatesWithCategories[categoryId] = [];
      }
      templatesWithCategories[categoryId].push({
        id: templateDoc.id,
        ...templateData
      });
    });

    // Display templates grouped by category
    Object.entries(templatesWithCategories).forEach(([categoryId, templates]) => {
      const category = categories[categoryId];
      console.log(`\n📁 Category: ${category?.name || 'Unknown Category'} (ID: ${categoryId})`);
      templates.forEach(template => {
        console.log(`  📄 Template: ${template.title}`);
        console.log(`     ID: ${template.id}`);
        console.log(`     Default: ${template.is_default}`);
        console.log(`     Version: ${template.version}`);
      });
    });

    // 2. Default Templates by Category
    console.log('\n\n2. DEFAULT TEMPLATES BY CATEGORY:');
    console.log('=' .repeat(50));
    const defaultTemplatesByCategory: { [categoryId: string]: Template[] } = {};
    
    templatesSnapshot.forEach((templateDoc) => {
      const templateData = templateDoc.data() as Template;
      
      // Filter only default templates
      if (templateData.is_default) {
        if (!defaultTemplatesByCategory[templateData.category_id]) {
          defaultTemplatesByCategory[templateData.category_id] = [];
        }
        defaultTemplatesByCategory[templateData.category_id].push({
          id: templateDoc.id,
          ...templateData
        });
      }
    });

    // Display default templates
    Object.entries(defaultTemplatesByCategory).forEach(([categoryId, templates]) => {
      const category = categories[categoryId];
      console.log(`\n📁 Category: ${category?.name || 'Unknown Category'} (ID: ${categoryId})`);
      templates.forEach(template => {
        console.log(`  📄 Default Template: ${template.title}`);
        console.log(`     ID: ${template.id}`);
        console.log(`     Version: ${template.version}`);
      });
    });

    // 3. Orphaned Templates
    console.log('\n\n3. ORPHANED TEMPLATES:');
    console.log('=' .repeat(50));
    const orphanedTemplates: Template[] = [];
    
    templatesSnapshot.forEach((templateDoc) => {
      const templateData = templateDoc.data() as Template;
      
      // Check if category exists
      if (!categories[templateData.category_id]) {
        orphanedTemplates.push({
          id: templateDoc.id,
          ...templateData
        });
      }
    });

    if (orphanedTemplates.length > 0) {
      console.log('⚠️  Orphaned Templates Found:');
      orphanedTemplates.forEach(template => {
        console.log(`  📄 Orphaned Template: ${template.title}`);
        console.log(`     ID: ${template.id}`);
        console.log(`     Invalid Category ID: ${template.category_id}`);
      });
    } else {
      console.log('✅ No orphaned templates found.');
    }

  } catch (error) {
    console.error('❌ Template Analysis Failed:', error);
  }
};

const init = async () => {
  try {
    console.log('\n🔍 Analyzing Templates and Categories...');
    await fetchTemplatesWithCategories();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization Failed:', error);
    process.exit(1);
  }
};

init();
