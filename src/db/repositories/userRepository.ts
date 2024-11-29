import { getDatabase } from '../client';
import { User } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export const userRepository = {
  async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newUser: User = {
      id,
      ...user,
      created_at: now,
    };

    const store = db.transaction('users', 'readwrite').store;
    await store.add(newUser);
    return newUser;
  },

  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    return db.get('users', id);
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    const index = db.transaction('users').store.index('by-email');
    return index.get(email);
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const db = getDatabase();
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...existing,
      ...user,
      id,
    };

    await db.put('users', updatedUser);
    return updatedUser;
  }
};