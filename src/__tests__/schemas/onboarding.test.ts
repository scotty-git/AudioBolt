import { describe, it, expect } from 'vitest';
import { questionSchema, sectionSchema } from '../../schemas/onboarding';

describe('Schema Validation', () => {
  describe('Question Schema', () => {
    it('validates text question', () => {
      const textQuestion = {
        id: 'q1',
        type: 'text',
        text: 'What is your name?',
        validation: { required: true },
      };

      const result = questionSchema.safeParse(textQuestion);
      expect(result.success).toBe(true);
    });
  });

  describe('Section Schema', () => {
    it('validates complete section', () => {
      const section = {
        id: 'section-1',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        questions: [
          {
            id: 'q1',
            type: 'text',
            text: 'What is your name?',
            validation: { required: true },
          },
        ],
        order: 1,
        isOptional: false,
      };

      const result = sectionSchema.safeParse(section);
      expect(result.success).toBe(true);
    });
  });
});