import { getDatabase } from '../client';

export interface Template {
  id: string;
  type: 'onboarding' | 'questionnaire';
  version: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string;
  sections: Array<{
    id: string;
    title: string;
    description: string;
    questions: Array<{
      id: string;
      type: string;
      text: string;
      options?: string[];
      validation?: {
        required?: boolean;
      };
    }>;
  }>;
}

export const templateRepository = {
  async getById(id: string): Promise<Template | null> {
    const db = getDatabase();
    try {
      const template = await db.get('templates', id);
      if (!template) return null;
      
      // Parse the content string into sections
      const parsed = JSON.parse(template.content);
      return {
        ...template,
        sections: parsed.sections || []
      };
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  },

  async getAll(): Promise<Template[]> {
    const db = getDatabase();
    try {
      const templates = await db.getAll('templates');
      return templates.map(template => ({
        ...template,
        sections: JSON.parse(template.content).sections || []
      }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  },

  async create(template: Omit<Template, 'created_at' | 'updated_at'>): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const newTemplate = {
      ...template,
      content: JSON.stringify({ sections: template.sections }),
      created_at: now,
      updated_at: now
    };

    try {
      await db.put('templates', newTemplate);
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async update(template: Template): Promise<void> {
    const db = getDatabase();
    const updatedTemplate = {
      ...template,
      content: JSON.stringify({ sections: template.sections }),
      updated_at: new Date().toISOString()
    };

    try {
      await db.put('templates', updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    try {
      await db.delete('templates', id);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}; 