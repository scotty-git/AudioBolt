export const clearOnboardingData = () => {
  const keys = Object.keys(localStorage);
  
  const onboardingKeys = keys.filter(key => 
    key.startsWith('onboarding_') || 
    key.startsWith('user_progress_')
  );
  
  onboardingKeys.forEach(key => localStorage.removeItem(key));
  
  return onboardingKeys.length;
};