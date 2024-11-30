import { useMemo } from 'react';
import { cn } from '../../utils/cn';
import type { AuthError } from '../../hooks/useAuth';

interface AuthErrorDisplayProps {
  errorMessage?: string | null | AuthError;
  className?: string;
}

export const AuthErrorDisplay = ({ errorMessage, className }: AuthErrorDisplayProps) => {
  const friendlyMessage = useMemo(() => {
    if (!errorMessage) return null;

    // Handle AuthError type
    if (typeof errorMessage === 'object' && 'code' in errorMessage) {
      return getFirebaseErrorMessage(errorMessage.code);
    }

    // Handle string error messages
    return getFirebaseErrorMessage(errorMessage);
  }, [errorMessage]);

  if (!friendlyMessage) return null;

  return (
    <div
      className={cn(
        'rounded-md bg-red-50 p-4 border border-red-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{friendlyMessage}</p>
        </div>
      </div>
    </div>
  );
};

function getFirebaseErrorMessage(error: string): string {
  const lowerError = error.toLowerCase();
  
  // Authentication errors
  if (lowerError.includes('auth/user-not-found') || lowerError.includes('auth/wrong-password')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (lowerError.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Please sign in or use a different email.';
  }
  
  if (lowerError.includes('auth/weak-password')) {
    return 'Please choose a stronger password. It should be at least 6 characters long.';
  }
  
  if (lowerError.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  
  if (lowerError.includes('auth/too-many-requests')) {
    return 'Too many failed attempts. Please try again later.';
  }
  
  if (lowerError.includes('auth/network-request-failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (lowerError.includes('auth/popup-closed-by-user')) {
    return 'Sign in was cancelled. Please try again.';
  }
  
  if (lowerError.includes('auth/requires-recent-login')) {
    return 'This action requires you to sign in again for security. Please sign out and sign back in.';
  }
  
  if (lowerError.includes('auth/operation-not-allowed')) {
    return 'This sign in method is not enabled. Please contact support.';
  }

  // Profile update errors
  if (lowerError.includes('failed to update profile')) {
    return 'Unable to update your profile. Please try again.';
  }

  // Email update errors
  if (lowerError.includes('failed to update email')) {
    return 'Unable to update your email. Please try again later.';
  }

  // Return the original message if no specific mapping found
  return error;
};
