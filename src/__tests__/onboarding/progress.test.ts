import { describe, it, expect } from 'vitest';
import { calculateProgress } from '../../utils/progressCalculation';
import { Section, Response } from '../../types/onboarding';

describe('Progress Tracking', () => {
  const mockSections: Section[] = [
    {
      id: 'section-1',
      title: 'Section 1',
      description: 'Test Section 1',
      order: 0,
      isOptional: false,
      questions: [
        {
          id: 'q1',
          type: 'text',
          text: 'Question 1',
          validation: { required: true }
        },
        {
          id: 'q2',
          type: 'text',
          text: 'Question 2',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'section-2',
      title: 'Section 2',
      description: 'Test Section 2',
      order: 1,
      isOptional: true,
      questions: [
        {
          id: 'q3',
          type: 'text',
          text: 'Question 3',
          validation: { required: false }
        }
      ]
    }
  ];

  it('calculates 100% progress for fully completed sections', () => {
    const responses: Record<string, Response> = {
      q1: { questionId: 'q1', value: 'test', timestamp: new Date().toISOString() },
      q2: { questionId: 'q2', value: 'test', timestamp: new Date().toISOString() }
    };

    const skippedSectionIds = ['section-2'];
    const progress = calculateProgress(mockSections, responses, skippedSectionIds);

    expect(progress.percentage).toBe(100);
    expect(progress.completedQuestions).toBe(2);
    expect(progress.totalQuestions).toBe(2);
  });

  it('calculates partial progress correctly', () => {
    const responses: Record<string, Response> = {
      q1: { questionId: 'q1', value: 'test', timestamp: new Date().toISOString() }
    };

    const skippedSectionIds: string[] = [];
    const progress = calculateProgress(mockSections, responses, skippedSectionIds);

    expect(progress.percentage).toBe(33.33);
    expect(progress.completedQuestions).toBe(1);
    expect(progress.totalQuestions).toBe(3);
  });

  it('excludes skipped sections from progress calculation', () => {
    const responses: Record<string, Response> = {
      q1: { questionId: 'q1', value: 'test', timestamp: new Date().toISOString() }
    };

    const skippedSectionIds = ['section-2'];
    const progress = calculateProgress(mockSections, responses, skippedSectionIds);

    expect(progress.percentage).toBe(50);
    expect(progress.completedQuestions).toBe(1);
    expect(progress.totalQuestions).toBe(2);
  });
});