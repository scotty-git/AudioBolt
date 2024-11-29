import { describe, it, expect } from 'vitest';
import { validateTemplate, validateQuestion } from '../utils/validation';
import sampleTemplate from '../data/sampleTemplate.json';

describe('Template Validation', () => {
  it('validates a correct template', () => {
    const result = validateTemplate(sampleTemplate);
    expect(result.success).toBe(true);
  });

  it('fails on invalid template structure', () => {
    const invalidTemplate = {
      ...sampleTemplate,
      questions: null // Invalid questions field
    };
    const result = validateTemplate(invalidTemplate);
    expect(result.success).toBe(false);
  });

  it('validates required fields', () => {
    const incompleteTemplate = {
      templateId: '123',
      // Missing required fields
    };
    const result = validateTemplate(incompleteTemplate);
    expect(result.success).toBe(false);
  });
});

describe('Question Validation', () => {
  it('validates a correct question', () => {
    const validQuestion = sampleTemplate.questions[0];
    const result = validateQuestion(validQuestion);
    expect(result.success).toBe(true);
  });

  it('fails on invalid question type', () => {
    const invalidQuestion = {
      ...sampleTemplate.questions[0],
      type: 'invalid-type'
    };
    const result = validateQuestion(invalidQuestion);
    expect(result.success).toBe(false);
  });
});