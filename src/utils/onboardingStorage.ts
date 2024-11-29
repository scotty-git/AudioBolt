import { 
  OnboardingFlow, 
  UserProgress,
  onboardingFlowSchema,
  userProgressSchema 
} from '../types/onboarding';
import { defaultOnboardingFlow } from '../data/defaultOnboardingFlow';
import { storage } from './storage/storageWrapper';
import { v4 as uuidv4 } from 'uuid';

const FLOW_STORAGE_KEY = 'onboarding_flow';
const PROGRESS_STORAGE_KEY = 'onboarding_progress';

export const createNewFlow = (): OnboardingFlow => ({
  id: uuidv4(),
  title: '',
  description: '',
  type: 'onboarding',
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0',
  status: 'draft',
  sections: [],
  settings: {
    allowSkipSections: false,
    requireAllSections: true,
    showProgressBar: true,
    allowSaveProgress: true
  }
});

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

export const saveOnboardingFlow = (flow: OnboardingFlow): void => {
  const result = onboardingFlowSchema.safeParse(flow);
  if (!result.success) {
    console.error('Invalid onboarding flow:', result.error);
    throw new Error('Invalid onboarding flow structure');
  }
  storage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flow));
};

export const loadOnboardingFlow = (): OnboardingFlow => {
  try {
    const data = storage.getItem(FLOW_STORAGE_KEY);
    if (!data) {
      saveOnboardingFlow(defaultOnboardingFlow);
      return defaultOnboardingFlow;
    }

    const flow = JSON.parse(data);
    const result = onboardingFlowSchema.safeParse(flow);
    if (!result.success) {
      console.error('Invalid stored flow:', result.error);
      saveOnboardingFlow(defaultOnboardingFlow);
      return defaultOnboardingFlow;
    }
    return flow;
  } catch (error) {
    console.error('Error loading onboarding flow:', error);
    saveOnboardingFlow(defaultOnboardingFlow);
    return defaultOnboardingFlow;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    const result = userProgressSchema.safeParse(progress);
    if (!result.success) {
      console.error('Invalid user progress:', result.error);
      throw new Error('Invalid user progress structure');
    }
    const key = `${PROGRESS_STORAGE_KEY}_${progress.userId}_${progress.flowId}`;
    storage.setItem(key, JSON.stringify(progress));
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

    const progress = JSON.parse(data);
    const result = userProgressSchema.safeParse(progress);
    if (!result.success) {
      console.error('Invalid stored progress:', result.error);
      return null;
    }
    return progress;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
};