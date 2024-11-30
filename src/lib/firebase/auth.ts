import { 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from './config';
import { 
  createOrUpdateUser, 
  createOrUpdateUserProfile,
  type DBUser,
  type UserProfile 
} from './database';

// Development mode check
const isDevelopment = import.meta.env.DEV;

// User-friendly error messages
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This authentication method is not enabled.',
  'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please register first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid login credentials. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
};

// Helper to get user-friendly error message
const getErrorMessage = (error: AuthError): string => {
  return AUTH_ERROR_MESSAGES[error.code] || error.message;
};

// Development mode fallback user
const DEV_USER = {
  uid: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Development User',
  isAnonymous: false,
};

export const signInAnon = async (): Promise<User | null> => {
  try {
    console.log('[Auth] Attempting anonymous sign in...');
    
    if (isDevelopment) {
      console.log('[Auth] Development mode - using fallback user');
      return DEV_USER as unknown as User;
    }

    const { user } = await signInAnonymously(auth);
    await createOrUpdateUser(user);
    await createOrUpdateUserProfile(user.uid, {});
    console.log('[Auth] Anonymous sign in successful');
    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('[Auth] Anonymous sign in failed:', getErrorMessage(authError));
    throw new Error(getErrorMessage(authError));
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    console.log('[Auth] Attempting email sign in...');
    
    if (isDevelopment && email === DEV_USER.email) {
      console.log('[Auth] Development mode - using fallback user');
      return DEV_USER as unknown as User;
    }

    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await createOrUpdateUser(user);
    console.log('[Auth] Email sign in successful');
    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('[Auth] Email sign in failed:', getErrorMessage(authError));
    throw new Error(getErrorMessage(authError));
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<User> => {
  try {
    console.log('[Auth] Attempting to create new user...');
    
    if (isDevelopment && email === DEV_USER.email) {
      console.log('[Auth] Development mode - using fallback user');
      return DEV_USER as unknown as User;
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    await createOrUpdateUser(user);
    await createOrUpdateUserProfile(user.uid, {});
    console.log('[Auth] User creation successful');
    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('[Auth] User creation failed:', getErrorMessage(authError));
    throw new Error(getErrorMessage(authError));
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log('[Auth] Signing out...');
    await firebaseSignOut(auth);
    console.log('[Auth] Sign out successful');
  } catch (error) {
    const authError = error as AuthError;
    console.error('[Auth] Sign out failed:', getErrorMessage(authError));
    throw new Error(getErrorMessage(authError));
  }
};

export const observeAuthState = (callback: (user: User | null) => void): (() => void) => {
  console.log('[Auth] Setting up auth state observer');
  
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('[Auth] User state changed:', user.isAnonymous ? 'Anonymous' : 'Authenticated');
      if (!user.isAnonymous) {
        await createOrUpdateUser(user);
      }
    } else {
      console.log('[Auth] User signed out');
    }
    callback(user);
  });
};