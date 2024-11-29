import { describe, it, expect, beforeEach } from 'vitest';
import { saveQuestionnaire, loadQuestionnaire, clearQuestionnaire } from '../utils/localStorage';
import { QuestionnaireTemplate } from '../types/questionnaire';

describe('LocalStorage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleQuestionnaire: QuestionnaireTemplate = {
    id: '1',
    title: 'Test Questionnaire',
    description: 'Test Description',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Test Question',
        options: ['Option 1', 'Option 2'],
        required: true
      }
    ]
  };

  it('saves questionnaire to localStorage', () => {
    saveQuestionnaire(sampleQuestionnaire);
    const stored = localStorage.getItem('questionnaire');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual(sampleQuestionnaire);
  });

  it('loads questionnaire from localStorage', () => {
    localStorage.setItem('questionnaire', JSON.stringify(sampleQuestionnaire));
    const loaded = loadQuestionnaire();
    expect(loaded).toEqual(sampleQuestionnaire);
  });

  it('returns null when no questionnaire exists', () => {
    const loaded = loadQuestionnaire();
    expect(loaded).toBeNull();
  });

  it('clears questionnaire from localStorage', () => {
    saveQuestionnaire(sampleQuestionnaire);
    clearQuestionnaire();
    expect(localStorage.getItem('questionnaire')).toBeNull();
  });
});