import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Template, Response } from './schema';
import { runInitialMigration } from './migrations/initial';

// Add global indexedDB for Node.js environment
if (typeof window === 'undefined') {
  const { indexedDB, IDBKeyRange } = await import('fake-indexeddb');
  global.indexedDB = indexedDB;
  global.IDBKeyRange = IDBKeyRange;
}

interface AppDB extends DBSchema {
  templates: {
    key: string;
    value: Template;
    indexes: {
      'by-type': string;
      'by-status': string;
    };
  };
  responses: {
    key: string;
    value: Response;
    indexes: {
      'by-template': string;
      'by-user': string;
    };
  };
}

let db: IDBPDatabase<AppDB>;

export const initializeDatabase = async () => {
  try {
    db = await openDB<AppDB>('audiobook-questionnaire', 1, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('by-type', 'type');
          templateStore.createIndex('by-status', 'status');
        }

        if (!db.objectStoreNames.contains('responses')) {
          const responseStore = db.createObjectStore('responses', { keyPath: 'id' });
          responseStore.createIndex('by-template', 'template_id');
          responseStore.createIndex('by-user', 'user_id');
        }
      },
    });

    // Run initial migration
    await runInitialMigration();
    
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};