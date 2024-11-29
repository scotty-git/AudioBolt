import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../client';
import { Template } from '../schema';

export const templateRepository = {
  async clearAll(): Promise<void> {
    const db = getDatabase();
    await db.clear('templates');
  },

  async findAll(): Promise<Template[]> {
    const db = getDatabase();
    return db.getAll('templates');
  },

  async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTemplate: Template = {
      id,
      ...template,
      created_at: now,
      updated_at: now,
    };

    if (template.is_default) {
      // Remove default status from other templates of same type
      const tx = db.transaction('templates', 'readwrite');
      const index = tx.store.index('by-type');
      for await (const cursor of index.iterate(template.type)) {
        if (cursor.value.is_default) {
          const template = { ...cursor.value, is_default: false };
          await cursor.update(template);
        }
      }
      await tx.done;
    }

    await db.add('templates', newTemplate);
    return newTemplate;
  },

  async findById(id: string): Promise<Template | null> {
    const db = getDatabase();
    return db.get('templates', id);
  },

  async findByType(type: Template['type']): Promise<Template[]> {
    const db = getDatabase();
    const index = db.transaction('templates').store.index('by-type');
    return index.getAll(type);
  },

  async getDefaultTemplate(type: Template['type']): Promise<Template | null> {
    const db = getDatabase();
    const templates = await this.findByType(type);
    return templates.find(t => t.is_default) || null;
  },

  async setDefault(id: string): Promise<Template> {
    const db = getDatabase();
    const template = await this.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const tx = db.transaction('templates', 'readwrite');
    
    // Remove default status from other templates of same type
    const index = tx.store.index('by-type');
    for await (const cursor of index.iterate(template.type)) {
      if (cursor.value.is_default) {
        const template = { ...cursor.value, is_default: false };
        await cursor.update(template);
      }
    }

    // Set new default
    template.is_default = true;
    await tx.store.put(template);
    await tx.done;

    return template;
  },

  async update(id: string, template: Partial<Template>): Promise<Template> {
    const db = getDatabase();
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Template not found');
    }

    const now = new Date().toISOString();
    const updatedTemplate = {
      ...existing,
      ...template,
      id,
      updated_at: now,
    };

    if (template.is_default) {
      await this.setDefault(id);
    } else {
      await db.put('templates', updatedTemplate);
    }

    return updatedTemplate;
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete('templates', id);
  }
};