import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

interface RequireAuthProps {
  children: React.ReactNode;
  allowAnonymous?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowAnonymous = false 
}) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || (!allowAnonymous && user.isAnonymous)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};