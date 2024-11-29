import { useEffect, useState } from 'react';
import { isFirebaseInitialized } from '../lib/firebase/config';

export const useFirebase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const initialized = isFirebaseInitialized();
      setIsInitialized(initialized);
      
      if (!initialized) {
        throw new Error('Firebase failed to initialize');
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error initializing Firebase'));
    }
  }, []);

  return {
    isInitialized,
    error
  };
};