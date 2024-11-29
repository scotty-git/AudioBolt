import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'audiobook-templates';
const STORE_NAME = 'templates';
const VERSION = 1;

export interface Template {
  id: string;
  type: 'onboarding' | 'questionnaire';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const initDB = async () => {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-type', 'type');
        store.createIndex('by-created', 'createdAt');
      }
    },
  });
};

export const templateStorage = {
  async addTestTemplate() {
    const db = await initDB();
    const now = new Date().toISOString();
    const template: Template = {
      id: uuidv4(),
      type: 'onboarding',
      title: 'Test Template',
      content: JSON.stringify({
        questions: [
          {
            id: 'q1',
            type: 'text',
            text: 'What is your goal?',
            required: true
          }
        ]
      }),
      createdAt: now,
      updatedAt: now
    };

    await db.add(STORE_NAME, template);
    return template.id;
  },

  async getAllTemplates(): Promise<Template[]> {
    const db = await initDB();
    return db.getAll(STORE_NAME);
  },

  async getTemplateById(id: string): Promise<Template | undefined> {
    const db = await initDB();
    return db.get(STORE_NAME, id);
  },

  async deleteTemplate(id: string): Promise<void> {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
  }
};