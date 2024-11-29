import { describe, it, expect, beforeEach } from 'vitest';
import { saveUserProgress, loadUserProgress } from '../../utils/onboardingStorage';
import { UserProgress, Response } from '../../types/onboarding';

describe('Response Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockProgress: UserProgress = {
    userId: 'user-1',
    flowId: 'flow-1',
    progress: {
      completedSections: ['section-1'],
      skippedSections: [],
      currentSectionId: 'section-2',
      lastUpdated: new Date().toISOString()
    },
    responses: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deviceInfo: 'test',
      userAgent: 'test'
    }
  };

  it('saves and loads text responses correctly', () => {
    const textResponse: Response = {
      questionId: 'q1',
      value: 'test answer',
      timestamp: new Date().toISOString()
    };

    mockProgress.responses.push(textResponse);
    saveUserProgress(mockProgress);

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toBe('test answer');
  });

  it('saves and loads multiple choice responses correctly', () => {
    const mcResponse: Response = {
      questionId: 'q2',
      value: ['option1', 'option2'],
      timestamp: new Date().toISOString()
    };

    mockProgress.responses.push(mcResponse);
    saveUserProgress(mockProgress);

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toEqual(['option1', 'option2']);
  });

  it('saves and loads slider responses correctly', () => {
    const sliderResponse: Response = {
      questionId: 'q3',
      value: 5,
      timestamp: new Date().toISOString()
    };

    mockProgress.responses.push(sliderResponse);
    saveUserProgress(mockProgress);

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toBe(5);
  });

  it('resumes from last completed section', () => {
    saveUserProgress(mockProgress);
    const loaded = loadUserProgress('user-1', 'flow-1');
    
    expect(loaded?.progress.currentSectionId).toBe('section-2');
    expect(loaded?.progress.completedSections).toContain('section-1');
  });
});