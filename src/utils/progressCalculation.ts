import { Section, Response } from '../types/onboarding';
import { getVisibleQuestions } from './conditionalLogic';

interface ProgressStats {
  completedQuestions: number;
  totalQuestions: number;
  percentage: number;
}

export const calculateProgress = (
  sections: Section[] | undefined,
  responses: Record<string, Response>,
  skippedSectionIds: string[]
): ProgressStats => {
  if (!sections || sections.length === 0) {
    return {
      completedQuestions: 0,
      totalQuestions: 0,
      percentage: 0
    };
  }

  let completedQuestions = 0;
  let totalQuestions = 0;

  sections.forEach(section => {
    if (skippedSectionIds.includes(section.id)) return;

    const visibleQuestions = getVisibleQuestions(section.questions, responses);
    totalQuestions += visibleQuestions.length;

    visibleQuestions.forEach(question => {
      if (responses[question.id]?.value !== undefined) {
        completedQuestions++;
      }
    });
  });

  const percentage = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100 * 100) / 100
    : 0;

  return {
    completedQuestions,
    totalQuestions,
    percentage
  };
};

export const isSectionComplete = (
  section: Section,
  responses: Record<string, Response>
): boolean => {
  if (!section) return false;
  
  const visibleQuestions = getVisibleQuestions(section.questions, responses);
  return visibleQuestions.every(question => {
    if (!question.validation.required) return true;
    return responses[question.id]?.value !== undefined;
  });
};