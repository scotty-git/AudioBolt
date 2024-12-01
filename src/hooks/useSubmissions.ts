import { useCallback } from 'react';
import { submissionRepository, SubmissionData } from '../db/repositories/submissions';

export interface OnboardingData {
  templateId: string;
  answers: Record<string, string | string[]>;
  metadata: {
    templateTitle: string;
    completedSections: string[];
    currentSectionIndex: number;
    content: string;
  };
}

export interface QuestionnaireData {
  templateId: string;
  answers: Record<string, string | string[]>;
  metadata: {
    templateTitle: string;
    completedSections: string[];
    currentSectionIndex: number;
    content: string;
  };
}

export const useSubmissions = () => {
  const submitOnboarding = useCallback(async (data: OnboardingData): Promise<void> => {
    const submission: SubmissionData = {
      type: 'onboarding',
      userId: 'anonymous',
      userEmail: 'anonymous@example.com',
      templateId: data.templateId,
      answers: data.answers,
      metadata: data.metadata
    };
    return submissionRepository.create(submission);
  }, []);

  const submitQuestionnaire = useCallback(async (data: QuestionnaireData): Promise<void> => {
    const submission: SubmissionData = {
      type: 'questionnaire',
      userId: 'anonymous',
      userEmail: 'anonymous@example.com',
      templateId: data.templateId,
      answers: data.answers,
      metadata: data.metadata
    };
    return submissionRepository.create(submission);
  }, []);

  return {
    submitOnboarding,
    submitQuestionnaire
  };
};