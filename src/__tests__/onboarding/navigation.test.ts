import { describe, it, expect } from 'vitest';
import { Section, Response } from '../../types/onboarding';
import { isSectionComplete } from '../../utils/progressCalculation';

describe('Navigation Tests', () => {
  const mockSection: Section = {
    id: 'section-1',
    title: 'Test Section',
    description: 'Test Description',
    order: 0,
    isOptional: false,
    questions: [
      {
        id: 'q1',
        type: 'text',
        text: 'Required Question',
        validation: { required: true }
      }
    ]
  };

  it('validates section completion correctly', () => {
    const responses: Record<string, Response> = {
      q1: { 
        questionId: 'q1', 
        value: 'test answer',
        timestamp: new Date().toISOString()
      }
    };
    const isComplete = isSectionComplete(mockSection, responses);
    expect(isComplete).toBe(true);
  });
});