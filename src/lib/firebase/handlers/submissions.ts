import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import { userDb, onboardingDb, questionnaireDb } from '../db';
import type { OnboardingSubmission, QuestionnaireSubmission } from '../types';

export interface OnboardingData {
  flowId: string;
  responses: Record<string, any>;
  progress: {
    completedSections: string[];
    skippedSections: string[];
    currentSectionId?: string;
  };
  metadata?: Record<string, any>;
}

export interface QuestionnaireData {
  templateId: string;
  answers: Record<string, any>;
  metadata?: Record<string, any>;
}

export const handleOnboardingSubmit = async (
  userId: string,
  email: string,
  data: OnboardingData
): Promise<string> => {
  try {
    // Ensure user exists
    const existingUser = await userDb.getById(userId);
    if (!existingUser) {
      await userDb.create({
        id: userId,
        email
      });
    }

    // Create submission
    const submissionId = uuidv4();
    const submission: Omit<OnboardingSubmission, 'startedAt' | 'lastUpdated'> = {
      id: submissionId,
      userId,
      flowId: data.flowId,
      responses: data.responses,
      progress: {
        ...data.progress,
        lastUpdated: Timestamp.now()
      },
      metadata: {
        ...data.metadata,
        deviceInfo: window.navigator.platform,
        userAgent: window.navigator.userAgent
      }
    };

    await onboardingDb.create(submission);
    return submissionId;
  } catch (error) {
    console.error('Error handling onboarding submission:', error);
    throw new Error('Failed to save onboarding submission');
  }
};

export const handleQuestionnaireSubmit = async (
  userId: string,
  email: string,
  data: QuestionnaireData
): Promise<string> => {
  try {
    // Ensure user exists
    const existingUser = await userDb.getById(userId);
    if (!existingUser) {
      await userDb.create({
        id: userId,
        email
      });
    }

    // Create submission
    const submissionId = uuidv4();
    const submission: Omit<QuestionnaireSubmission, 'startedAt' | 'lastUpdated'> = {
      id: submissionId,
      userId,
      templateId: data.templateId,
      answers: data.answers,
      status: 'completed',
      completedAt: Timestamp.now(),
      metadata: {
        ...data.metadata,
        deviceInfo: window.navigator.platform,
        userAgent: window.navigator.userAgent
      }
    };

    await questionnaireDb.create(submission);
    return submissionId;
  } catch (error) {
    console.error('Error handling questionnaire submission:', error);
    throw new Error('Failed to save questionnaire submission');
  }
};