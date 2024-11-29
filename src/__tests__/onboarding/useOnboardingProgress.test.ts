import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingProgress } from '../../pages/UserOnboarding/hooks/useOnboardingProgress';
import { saveUserProgress } from '../../utils/onboardingStorage';

vi.mock('../../utils/onboardingStorage', () => ({
  saveUserProgress: vi.fn(),
  createNewUserProgress: vi.fn(() => ({
    userId: 'user-1',
    flowId: 'test-flow',
    progress: {
      completedSections: [],
      skippedSections: [],
      currentSectionId: null,
      lastUpdated: new Date().toISOString()
    },
    responses: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deviceInfo: 'test',
      userAgent: 'test'
    }
  }))
}));

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty responses and progress', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    
    expect(result.current.responses).toEqual({});
    expect(result.current.progress.completedSections).toEqual([]);
    expect(result.current.progress.skippedSections).toEqual([]);
  });

  it('handles question responses correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    
    act(() => {
      result.current.handleResponse('q1', 'test answer');
    });

    expect(result.current.responses.q1.value).toBe('test answer');
    expect(result.current.responses.q1.questionId).toBe('q1');
    expect(result.current.responses.q1.timestamp).toBeDefined();
  });

  it('handles section skipping correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    
    act(() => {
      result.current.handleSkipSection('section1');
    });

    expect(result.current.progress.skippedSections).toContain('section1');
  });

  it('validates section completion correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    const mockSection = {
      id: 'section1',
      title: 'Test Section',
      description: 'Test Description',
      questions: [
        {
          id: 'q1',
          type: 'text',
          text: 'Test Question',
          validation: { required: true }
        }
      ],
      order: 0,
      isOptional: false
    };

    expect(result.current.isCurrentSectionValid(mockSection)).toBe(false);

    act(() => {
      result.current.handleResponse('q1', 'test answer');
    });

    expect(result.current.isCurrentSectionValid(mockSection)).toBe(true);
  });

  it('saves progress on completion', async () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    
    act(() => {
      result.current.handleComplete();
    });

    expect(saveUserProgress).toHaveBeenCalled();
    const savedProgress = vi.mocked(saveUserProgress).mock.calls[0][0];
    expect(savedProgress.metadata.completedAt).toBeDefined();
  });

  it('handles autosave correctly', () => {
    vi.useFakeTimers();
    renderHook(() => useOnboardingProgress('test-flow'));
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(saveUserProgress).toHaveBeenCalled();
    vi.useRealTimers();
  });
});