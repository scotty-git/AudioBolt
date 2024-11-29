import { getDatabase } from '../client';
import { ProgressTracking, SectionCompletion } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export const progressRepository = {
  async trackSectionCompletion(completion: Omit<SectionCompletion, 'id'>): Promise<SectionCompletion> {
    const db = getDatabase();
    const id = uuidv4();
    const newCompletion: SectionCompletion = {
      id,
      ...completion,
    };
    
    const store = db.transaction('section_completions', 'readwrite').store;
    await store.add(newCompletion);
    return newCompletion;
  },

  async updateProgress(progress: Omit<ProgressTracking, 'id'>): Promise<ProgressTracking> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const newProgress: ProgressTracking = {
      id,
      ...progress,
      last_updated: now,
    };

    const store = db.transaction('progress_tracking', 'readwrite').store;
    await store.put(newProgress);
    return newProgress;
  },

  async getProgress(responseId: string): Promise<ProgressTracking | null> {
    const db = getDatabase();
    const index = db.transaction('progress_tracking').store.index('by-response');
    return index.get(responseId);
  },

  async getSectionCompletions(responseId: string): Promise<SectionCompletion[]> {
    const db = getDatabase();
    const index = db.transaction('section_completions').store.index('by-response');
    return index.getAll(responseId);
  }
};