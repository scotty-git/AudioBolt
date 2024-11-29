import { FirebaseError } from '../errors/FirebaseError';
import { ERROR_MESSAGES } from '../config';

export const handleFirebaseError = (error: unknown, context: string): never => {
  console.error(`Firebase error in ${context}:`, error);
  
  throw FirebaseError.fromError(
    error,
    ERROR_MESSAGES.SUBMISSION_FAILED
  );
};

export const assertAuthenticated = (userId?: string, email?: string): void => {
  if (!userId || !email) {
    throw new FirebaseError(ERROR_MESSAGES.NOT_AUTHENTICATED);
  }
};