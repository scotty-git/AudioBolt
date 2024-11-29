import { useState, useEffect } from 'react';
import { Section } from '../types/onboarding';

export const useLazySection = (
  sectionId: string,
  loadSection: () => Promise<Section>
) => {
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSection = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedSection = await loadSection();
        if (mounted) {
          setSection(loadedSection);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load section'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSection();

    return () => {
      mounted = false;
    };
  }, [sectionId, loadSection]);

  return { section, isLoading, error };
};