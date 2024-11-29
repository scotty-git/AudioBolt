import { OnboardingFlow, onboardingFlowSchema } from '../../types/onboarding';
import { defaultOnboardingFlow } from '../../data/defaultOnboardingFlow';
import { storage } from '../storage';

const FLOW_STORAGE_KEY = 'onboarding_flow';

export const saveOnboardingFlow = (flow: OnboardingFlow): void => {
  try {
    const result = onboardingFlowSchema.safeParse(flow);
    if (!result.success) {
      console.error('Invalid onboarding flow:', result.error);
      throw new Error('Invalid onboarding flow structure');
    }
    storage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flow));
  } catch (error) {
    console.error('Error saving onboarding flow:', error);
    throw error;
  }
};

export const loadOnboardingFlow = (): OnboardingFlow | null => {
  try {
    const data = storage.getItem(FLOW_STORAGE_KEY);
    if (!data) {
      // Initialize with default flow
      const result = onboardingFlowSchema.safeParse(defaultOnboardingFlow);
      if (!result.success) {
        console.error('Invalid default flow:', result.error);
        return null;
      }
      saveOnboardingFlow(defaultOnboardingFlow);
      return defaultOnboardingFlow;
    }

    const parsedData = JSON.parse(data);
    const result = onboardingFlowSchema.safeParse(parsedData);
    if (!result.success) {
      console.error('Invalid stored flow:', result.error);
      // Reset to default if invalid
      saveOnboardingFlow(defaultOnboardingFlow);
      return defaultOnboardingFlow;
    }
    return result.data;
  } catch (error) {
    console.error('Error loading onboarding flow:', error);
    return null;
  }
};

export const clearOnboardingFlow = (): void => {
  try {
    storage.removeItem(FLOW_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing onboarding flow:', error);
  }
};