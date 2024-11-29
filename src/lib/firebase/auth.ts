import { 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from './config';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const signInAnon = async (): Promise<User> => {
  try {
    const { user } = await signInAnonymously(auth);
    return user;
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
};

export const observeAuthState = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};