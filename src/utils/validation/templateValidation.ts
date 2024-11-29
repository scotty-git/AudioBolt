import { onboardingFlowSchema } from '../../schemas/onboarding';

export const validateTemplate = (template: unknown) => {
  try {
    return onboardingFlowSchema.safeParse(template);
  } catch (error) {
    console.error('Template validation error:', error);
    return { success: false, error };
  }
};