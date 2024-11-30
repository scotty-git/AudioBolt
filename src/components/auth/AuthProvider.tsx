import React, { createContext, useContext, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInAnonymously: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, fallback }) => {
  console.log('[AuthProvider] Rendering');
  const auth = useAuth();
  const [retryCount, setRetryCount] = useState(0);

  console.log('[AuthProvider] State:', {
    loading: auth.loading,
    hasError: !!auth.error,
    hasUser: !!auth.user
  });

  const retry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  if (auth.loading) {
    console.log('[AuthProvider] Still loading, showing fallback');
    return <>{fallback}</>;
  }

  if (auth.error) {
    console.error('[AuthProvider] Error state:', auth.error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{auth.error.message}</p>
          <button 
            onClick={retry} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('[AuthProvider] Rendering children');
  return (
    <AuthContext.Provider value={{...auth, retry}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};