import { z } from 'zod';
import { onboardingFlowSchema } from '../schemas/onboarding';

export const emailSchema = z.string().email('Please enter a valid email address');

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const result = emailSchema.safeParse(email);
  return {
    isValid: result.success,
    error: result.success ? undefined : 'Please enter a valid email address'
  };
};

export const validateTemplate = (template: unknown) => {
  try {
    return onboardingFlowSchema.safeParse(template);
  } catch (error) {
    console.error('Template validation error:', error);
    return { success: false, error };
  }
};

export const clearOnboardingData = () => {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Filter keys related to onboarding
  const onboardingKeys = keys.filter(key => 
    key.startsWith('onboarding_') || 
    key.startsWith('user_progress_')
  );
  
  // Remove onboarding-related data
  onboardingKeys.forEach(key => localStorage.removeItem(key));
  
  return onboardingKeys.length; // Return number of cleared items
};