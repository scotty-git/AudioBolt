import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { observeAuthState, signInAnon, signIn, signUp, signOut } from '../lib/firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleError = (error: unknown) => {
    setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    setLoading(false);
  };

  const signInAnonymously = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInAnon();
      setUser(user);
    } catch (error) {
      handleError(error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await signIn(email, password);
      setUser(user);
    } catch (error) {
      handleError(error);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await signUp(email, password);
      setUser(user);
    } catch (error) {
      handleError(error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (error) {
      handleError(error);
    }
  };

  return {
    user,
    loading,
    error,
    signInAnonymously,
    login,
    register,
    logout
  };
};