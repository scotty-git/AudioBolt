import { Question, QuestionnaireSection } from '../../types/questionnaire';

export const validateResponse = (
  template: { sections: QuestionnaireSection[] },
  answers: Record<string, string | string[]>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  template.sections.forEach(section => {
    section.questions.forEach((question: Question) => {
      const answer = answers[question.id];
      if (question.validation?.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
        errors[question.id] = 'This question is required';
      }
    });
  });

  return errors;
};