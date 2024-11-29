import { useEffect, useRef } from 'react';
import { OnboardingFlow, UserProgress } from '../types/onboarding';
import { saveOnboardingFlow, saveUserProgress } from '../utils/onboardingStorage';

interface AutosaveConfig {
  interval?: number;
  onSave?: () => void;
}

export const useAutosave = (
  data: OnboardingFlow | UserProgress,
  config: AutosaveConfig = {}
) => {
  const { interval = 30000, onSave } = config;
  const lastSaved = useRef<Date>(new Date());

  useEffect(() => {
    const saveData = () => {
      try {
        if ('sections' in data) {
          saveOnboardingFlow(data as OnboardingFlow);
        } else {
          saveUserProgress(data as UserProgress);
        }
        lastSaved.current = new Date();
        onSave?.();
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    };

    const timer = setInterval(saveData, interval);
    return () => clearInterval(timer);
  }, [data, interval, onSave]);

  return {
    lastSaved: lastSaved.current,
  };
};