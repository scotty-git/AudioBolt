import { getDatabase } from '../client';
import { Response } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export const responseRepository = {
  async create(response: Omit<Response, 'id'>): Promise<Response> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newResponse: Response = {
      id,
      ...response,
      started_at: now,
      last_updated: now,
    };

    await db.add('responses', newResponse);
    return newResponse;
  },

  async findAll(): Promise<Response[]> {
    const db = getDatabase();
    return db.getAll('responses');
  },

  async findByTemplateId(templateId: string): Promise<Response[]> {
    const db = getDatabase();
    const index = db.transaction('responses').store.index('by-template');
    return index.getAll(templateId);
  },

  async findByUserId(userId: string): Promise<Response[]> {
    const db = getDatabase();
    const index = db.transaction('responses').store.index('by-user');
    return index.getAll(userId);
  },

  async update(id: string, response: Partial<Response>): Promise<Response> {
    const db = getDatabase();
    const existing = await db.get('responses', id);
    if (!existing) {
      throw new Error('Response not found');
    }

    const updatedResponse = {
      ...existing,
      ...response,
      last_updated: new Date().toISOString(),
    };

    await db.put('responses', updatedResponse);
    return updatedResponse;
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete('responses', id);
  }
};