import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/nodeConfig';
import { COLLECTIONS } from '../src/lib/firebase/collections';

const updateTemplateCategories = async (batch: any) => {
  const categoriesRef = collection(db, COLLECTIONS.TEMPLATE_CATEGORIES);
  const categoriesSnapshot = await getDocs(categoriesRef);

  const sortOrderMap: { [key: string]: number } = {
    'onboarding': 0,
    'questionnaire': 1
  };

  categoriesSnapshot.forEach((categoryDoc) => {
    const categoryData = categoryDoc.data();
    const categoryRef = doc(categoriesRef, categoryDoc.id);

    batch.update(categoryRef, {
      sort_order: sortOrderMap[categoryDoc.id] ?? 99,
      created_at: categoryData.created_at || Timestamp.now(),
      updated_at: Timestamp.now()
    });
  });
};

const updateTemplates = async (batch: any) => {
  const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
  const templatesSnapshot = await getDocs(templatesRef);

  templatesSnapshot.forEach((templateDoc) => {
    const templateData = templateDoc.data();
    const templateRef = doc(templatesRef, templateDoc.id);

    // Refactor sections to include field definitions
    const refactoredSections = (templateData.content?.sections || []).map((section: any) => ({
      ...section,
      fields: section.questions?.map((question: any) => ({
        id: question.id,
        type: question.type,
        validation: question.validation || {}
      })) || []
    }));

    batch.update(templateRef, {
      version: templateData.version || '1.0',
      created_at: templateData.created_at || Timestamp.now(),
      updated_at: Timestamp.now(),
      'content.sections': refactoredSections
    });
  });
};

const updateDatabaseSchema = async () => {
  try {
    const batch = writeBatch(db);

    console.log('🔄 Updating Template Categories Schema...');
    await updateTemplateCategories(batch);

    console.log('🔄 Updating Templates Schema...');
    await updateTemplates(batch);

    // Commit all batched writes
    await batch.commit();

    console.log('✅ Database Schema Update Complete');
  } catch (error) {
    console.error('❌ Schema Update Failed:', error);
    throw error;
  }
};

const init = async () => {
  try {
    console.log('\n🛠️  Initializing Database Schema Update...');
    await updateDatabaseSchema();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database Schema Update Failed:', error);
    process.exit(1);
  }
};

init();
