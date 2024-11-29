import { useState, useCallback, useMemo } from 'react';
import { useSubmissions } from '../../../hooks/useSubmissions';
import { OnboardingFlow, Section, Response } from '../../../types/onboarding';
import { isSectionComplete } from '../../../utils/progressCalculation';
import { useAutosave } from '../../../hooks/useAutosave';

export const useOnboardingProgress = (flowId: string) => {
  const { submitOnboarding } = useSubmissions();
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [progress, setProgress] = useState({
    completedSections: [] as string[],
    skippedSections: [] as string[],
    currentSectionId: undefined as string | undefined,
    lastUpdated: new Date().toISOString()
  });
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  const handleResponse = useCallback((questionId: string, value: any) => {
    setSaveStatus('saving');
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        value,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  const handleSkipSection = useCallback((sectionId: string) => {
    setSaveStatus('saving');
    setProgress(prev => ({
      ...prev,
      skippedSections: [...prev.skippedSections, sectionId],
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    try {
      setSaveStatus('saving');
      
      await submitOnboarding({
        flowId,
        responses,
        progress: {
          completedSections: progress.completedSections,
          skippedSections: progress.skippedSections,
          currentSectionId: progress.currentSectionId
        },
        metadata: {
          completedAt: new Date().toISOString()
        }
      });

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [flowId, responses, progress, submitOnboarding]);

  const isCurrentSectionValid = useCallback((section: Section): boolean => {
    if (!section || progress.skippedSections.includes(section.id)) {
      return true;
    }
    return isSectionComplete(section, responses);
  }, [progress.skippedSections, responses]);

  useAutosave({
    data: { responses, progress },
    onSave: async () => {
      try {
        await submitOnboarding({
          flowId,
          responses,
          progress: {
            completedSections: progress.completedSections,
            skippedSections: progress.skippedSections,
            currentSectionId: progress.currentSectionId
          }
        });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Autosave failed:', error);
        setSaveStatus('error');
      }
    }
  });

  return {
    responses,
    progress,
    saveStatus,
    handleResponse,
    handleSkipSection,
    handleComplete,
    isCurrentSectionValid,
  };
};