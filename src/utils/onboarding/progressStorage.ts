import { UserProgress, userProgressSchema } from '../../types/onboarding';
import { storage } from '../storage';

const PROGRESS_STORAGE_KEY = 'onboarding_progress';

export const createNewUserProgress = (userId: string, flowId: string): UserProgress => ({
  userId,
  flowId,
  progress: {
    completedSections: [],
    skippedSections: [],
    currentSectionId: undefined,
    lastUpdated: new Date().toISOString()
  },
  responses: [],
  metadata: {
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    deviceInfo: window.navigator.platform,
    userAgent: window.navigator.userAgent
  }
});

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    const result = userProgressSchema.safeParse(progress);
    if (!result.success) {
      console.error('Invalid user progress:', result.error);
      throw new Error('Invalid user progress structure');
    }
    const key = `${PROGRESS_STORAGE_KEY}_${progress.userId}_${progress.flowId}`;
    storage.setItem(key, JSON.stringify(result.data));
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

export const loadUserProgress = (userId: string, flowId: string): UserProgress | null => {
  try {
    const key = `${PROGRESS_STORAGE_KEY}_${userId}_${flowId}`;
    const data = storage.getItem(key);
    if (!data) return null;

    const parsedData = JSON.parse(data);
    const result = userProgressSchema.safeParse(parsedData);
    if (!result.success) {
      console.error('Invalid stored progress:', result.error);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
};