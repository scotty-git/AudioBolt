import { v4 as uuidv4 } from 'uuid';
import { responseRepository } from '../db/repositories';

export interface QuestionnaireResponse {
  templateId: string;
  answers: Record<string, string | string[]>;
  completedAt?: string;
}

export const saveQuestionnaireResponse = async (response: QuestionnaireResponse) => {
  try {
    await responseRepository.create({
      template_id: response.templateId,
      user_id: 'anonymous', // For now, we'll use anonymous user
      answers: JSON.stringify(response.answers),
      status: 'completed',
      completed_at: response.completedAt,
      metadata: JSON.stringify({
        deviceInfo: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Error saving questionnaire response:', error);
    throw error;
  }
};

export const loadQuestionnaireResponses = (): QuestionnaireResponse[] => {
  try {
    // For now, return empty array until IndexedDB is properly initialized
    return [];
  } catch (error) {
    console.error('Error loading questionnaire responses:', error);
    return [];
  }
};

export const validateResponse = (
  template: any,
  answers: Record<string, string | string[]>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  template.questions.forEach((question: any) => {
    const answer = answers[question.id];
    if (question.validation?.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      errors[question.id] = 'This question is required';
    }
  });

  return errors;
};