import { describe, it, expect, vi } from 'vitest';
import { Section, UserProgress } from '../../types/onboarding';
import { createNewUserProgress, saveUserProgress } from '../../utils/onboardingStorage';

describe('Section and Question Skipping', () => {
  const mockSection: Section = {
    id: 'section-1',
    title: 'Test Section',
    description: 'Test Description',
    order: 0,
    isOptional: true,
    questions: [
      {
        id: 'q1',
        type: 'text',
        text: 'Question 1',
        validation: { required: false }
      }
    ]
  };

  it('allows skipping optional sections', () => {
    const progress = createNewUserProgress('user-1', 'flow-1');
    progress.progress.skippedSections.push(mockSection.id);
    
    expect(progress.progress.skippedSections).toContain(mockSection.id);
    expect(progress.progress.completedSections).not.toContain(mockSection.id);
  });

  it('tracks skipped questions as undefined in responses', () => {
    const progress = createNewUserProgress('user-1', 'flow-1');
    expect(progress.responses[mockSection.questions[0].id]).toBeUndefined();
  });

  it('updates progress when skipping sections', () => {
    const progress = createNewUserProgress('user-1', 'flow-1');
    progress.progress.skippedSections.push(mockSection.id);
    progress.progress.lastUpdated = new Date().toISOString();

    expect(progress.progress.lastUpdated).toBeDefined();
    expect(progress.progress.skippedSections.length).toBe(1);
  });

  it('prevents skipping required sections', () => {
    const requiredSection: Section = {
      ...mockSection,
      isOptional: false
    };

    const progress = createNewUserProgress('user-1', 'flow-1');
    
    // Attempt to skip required section should throw
    expect(() => {
      progress.progress.skippedSections.push(requiredSection.id);
    }).toThrow();
  });
});