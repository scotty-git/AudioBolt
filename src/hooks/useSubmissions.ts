import { useCallback } from 'react';
import { useAuthContext } from '../components/auth/AuthProvider';
import { handleOnboardingSubmit, handleQuestionnaireSubmit } from '../lib/firebase/handlers';
import type { OnboardingData, QuestionnaireData } from '../lib/firebase/handlers/submissions';

export const useSubmissions = () => {
  const { user } = useAuthContext();

  const submitOnboarding = useCallback(async (data: OnboardingData) => {
    if (!user?.email) {
      throw new Error('User must be authenticated to submit onboarding');
    }

    return handleOnboardingSubmit(user.uid, user.email, data);
  }, [user]);

  const submitQuestionnaire = useCallback(async (data: QuestionnaireData) => {
    if (!user?.email) {
      throw new Error('User must be authenticated to submit questionnaire');
    }

    return handleQuestionnaireSubmit(user.uid, user.email, data);
  }, [user]);

  return {
    submitOnboarding,
    submitQuestionnaire
  };
};