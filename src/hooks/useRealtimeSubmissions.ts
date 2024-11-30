import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
  orderBy,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { useAuth } from './useAuth';
import type { OnboardingSubmission, QuestionnaireSubmission } from '../lib/firebase/database';

export type SubmissionType = OnboardingSubmission | QuestionnaireSubmission;

interface UseRealtimeSubmissionsState {
  submissions: SubmissionType[];
  loading: boolean;
  error: Error | null;
  networkStatus: 'online' | 'offline';
}

interface UseRealtimeSubmissionsOptions {
  type?: 'onboarding' | 'questionnaire';
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}

export const useRealtimeSubmissions = (options: UseRealtimeSubmissionsOptions = {}) => {
  const { user } = useAuth();
  const [state, setState] = useState<UseRealtimeSubmissionsState>({
    submissions: [],
    loading: true,
    error: null,
    networkStatus: 'online'
  });

  useEffect(() => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        submissions: [],
        error: new Error('User not authenticated')
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Build query
    const submissionsRef = collection(db, 'submissions');
    let queryConstraints: any[] = [where('uid', '==', user.uid)];

    if (options.type) {
      queryConstraints.push(where('type', '==', options.type));
    }

    if (options.orderByField) {
      queryConstraints.push(orderBy(
        options.orderByField, 
        options.orderDirection || 'desc'
      ));
    }

    const q = query(submissionsRef, ...queryConstraints);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      {
        next: (snapshot: QuerySnapshot<DocumentData>) => {
          const submissions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as SubmissionType[];

          setState(prev => ({ 
            ...prev,
            submissions,
            loading: false,
            error: null,
            networkStatus: 'online'
          }));

          // Log changes for debugging
          snapshot.docChanges().forEach(change => {
            console.log(
              `[Submissions] Document ${change.doc.id} ${change.type}:`,
              change.doc.data()
            );
          });
        },
        error: (error: FirestoreError) => {
          console.error('[Submissions] Real-time sync error:', error);

          // Handle offline state
          if (error.code === 'unavailable') {
            setState(prev => ({ 
              ...prev,
              loading: false,
              networkStatus: 'offline',
              error: new Error('Network connection lost. Using cached data.')
            }));
          } else {
            setState(prev => ({ 
              ...prev,
              loading: false,
              error: error
            }));
          }
        }
      }
    );

    // Cleanup subscription
    return () => {
      console.log('[Submissions] Cleaning up real-time listener');
      unsubscribe();
    };
  }, [user, options.type, options.orderByField, options.orderDirection]);

  // Helper function to check if a specific submission exists
  const hasSubmission = (submissionId: string): boolean => {
    return state.submissions.some(sub => sub.id === submissionId);
  };

  // Helper function to get a specific submission
  const getSubmission = (submissionId: string): SubmissionType | undefined => {
    return state.submissions.find(sub => sub.id === submissionId);
  };

  return {
    ...state,
    hasSubmission,
    getSubmission
  };
};
