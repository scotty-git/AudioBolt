export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

export const COLLECTIONS = {
  USERS: 'users',
  ONBOARDING_SUBMISSIONS: 'onboarding_submissions',
  QUESTIONNAIRE_SUBMISSIONS: 'questionnaire_submissions',
  TEMPLATES: 'templates'
} as const;

export const ERROR_MESSAGES = {
  NOT_AUTHENTICATED: 'User must be authenticated to perform this action',
  SUBMISSION_FAILED: 'Failed to save submission',
  USER_NOT_FOUND: 'User not found',
  TEMPLATE_NOT_FOUND: 'Template not found',
} as const;