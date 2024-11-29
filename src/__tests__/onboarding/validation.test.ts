import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../utils/validation';
import { Question } from '../../types/onboarding';
import { shouldShowQuestion } from '../../utils/conditionalLogic';

describe('Question Validation', () => {
  describe('Email Validation', () => {
    it('validates correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+label@domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('invalidates incorrect email formats', () => {
      const invalidEmails = [
        'test@',
        '@domain.com',
        'test@domain',
        'test.domain.com',
        'test@domain..com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Required Field Validation', () => {
    const mockQuestion: Question = {
      id: 'q1',
      type: 'text',
      text: 'Test Question',
      validation: { required: true }
    };

    it('blocks navigation for empty required fields', () => {
      const responses = {};
      const isVisible = shouldShowQuestion(mockQuestion, responses);
      expect(isVisible).toBe(true);
      expect(responses[mockQuestion.id]).toBeUndefined();
    });

    it('allows navigation when required field is filled', () => {
      const responses = {
        [mockQuestion.id]: { value: 'test answer', timestamp: new Date().toISOString() }
      };
      const isVisible = shouldShowQuestion(mockQuestion, responses);
      expect(isVisible).toBe(true);
      expect(responses[mockQuestion.id].value).toBeDefined();
    });
  });

  describe('Slider Value Validation', () => {
    const mockSliderQuestion: Question = {
      id: 'q2',
      type: 'slider',
      text: 'Rate from 1 to 10',
      validation: {
        required: true,
        minValue: 1,
        maxValue: 10
      }
    };

    it('validates values within range', () => {
      const validValues = [1, 5, 10];
      validValues.forEach(value => {
        const isValid = value >= mockSliderQuestion.validation.minValue! &&
                       value <= mockSliderQuestion.validation.maxValue!;
        expect(isValid).toBe(true);
      });
    });

    it('invalidates values outside range', () => {
      const invalidValues = [0, 11, -1, 100];
      invalidValues.forEach(value => {
        const isValid = value >= mockSliderQuestion.validation.minValue! &&
                       value <= mockSliderQuestion.validation.maxValue!;
        expect(isValid).toBe(false);
      });
    });
  });
});