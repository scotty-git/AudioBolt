import { Question, ConditionalLogic, Response } from '../types/onboarding';

export const evaluateCondition = (
  logic: ConditionalLogic,
  responses: Record<string, Response>
): boolean => {
  const response = responses[logic.questionId]?.value;
  if (response === undefined) return false;

  switch (logic.operator) {
    case 'equals':
      return response === logic.value;
    case 'not_equals':
      return response !== logic.value;
    case 'greater_than':
      return Number(response) > Number(logic.value);
    case 'less_than':
      return Number(response) < Number(logic.value);
    case 'contains':
      return String(response).toLowerCase().includes(String(logic.value).toLowerCase());
    default:
      return false;
  }
};

export const shouldShowQuestion = (
  question: Question,
  responses: Record<string, Response>
): boolean => {
  if (!question.conditionalLogic) return true;
  return evaluateCondition(question.conditionalLogic, responses);
};

export const getVisibleQuestions = (
  questions: Question[],
  responses: Record<string, Response>
): Question[] => {
  return questions.filter(question => shouldShowQuestion(question, responses));
};