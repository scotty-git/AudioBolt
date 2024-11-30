import { useState, useEffect, useCallback } from 'react';
import { User, updateEmail as firebaseUpdateEmail } from 'firebase/auth';
import { 
  observeAuthState, 
  signInAnon, 
  signIn, 
  signUp, 
  signOut,
  requestPasswordReset,
  type UserProfile 
} from '../lib/firebase/auth';

export type AuthError = {
  code: string;
  message: string;
};

interface AuthContextState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthContextState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    console.log('[useAuth] Setting up auth listener');

    const unsubscribe = observeAuthState((user) => {
      if (mounted) {
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          error: null,
        }));
      }
    });

    return () => {
      mounted = false;
      console.log('[useAuth] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const handleAuthError = useCallback((error: unknown) => {
    console.error('[useAuth] Authentication error:', error);
    const authError: AuthError = {
      code: error instanceof Error ? error.name : 'unknown',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
    
    setState(prev => ({
      ...prev,
      error: authError,
      loading: false,
    }));
    
    throw authError;
  }, []);

  const handleAuthAction = async <T,>(action: () => Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await action();
      setState(prev => ({ ...prev, loading: false, error: null }));
      return result;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const updateEmail = useCallback(async (newEmail: string) => {
    if (!state.user) throw new Error('No user logged in');
    return handleAuthAction(async () => {
      await firebaseUpdateEmail(state.user!, newEmail);
      return state.user!;
    });
  }, [state.user]);

  const signInUser = useCallback(async (email: string, password: string) => {
    return handleAuthAction(async () => signIn(email, password));
  }, []);

  const signUpUser = useCallback(async (email: string, password: string, displayName?: string) => {
    return handleAuthAction(async () => signUp(email, password, displayName));
  }, []);

  const signOutUser = useCallback(async () => {
    return handleAuthAction(async () => {
      await signOut();
      setState(prev => ({ ...prev, user: null, userProfile: null }));
    });
  }, []);

  const signInAnonUser = useCallback(async () => {
    return handleAuthAction(async () => signInAnon());
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return handleAuthAction(async () => {
      await requestPasswordReset(email);
      setState(prev => ({ 
        ...prev, 
        error: null,
        loading: false 
      }));
    });
  }, []);

  return {
    user: state.user,
    userProfile: state.userProfile,
    loading: state.loading,
    error: state.error,
    signIn: signInUser,
    signUp: signUpUser,
    signOut: signOutUser,
    signInAnon: signInAnonUser,
    updateEmail,
    resetPassword,
  };
};