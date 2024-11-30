import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  type Timestamp,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './config';
import type { User } from 'firebase/auth';

// Types
export interface DBUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  preferences: {
    genres: string[];
    favoriteAuthors: string[];
    readingSpeed: 'slow' | 'medium' | 'fast';
    preferredNarrators: string[];
  };
  settings: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OnboardingSubmission {
  uid: string;
  answers: Record<string, any>;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestionnaireSubmission {
  uid: string;
  questionnaireId: string;
  answers: Record<string, any>;
  score?: number;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Template {
  id: string;
  category: string;
  type: 'onboarding' | 'questionnaire';
  title: string;
  description: string;
  questions: Array<{
    id: string;
    type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
    question: string;
    options?: string[];
    required: boolean;
  }>;
  metadata: {
    version: string;
    tags: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedTime?: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  startAfter?: any;
  where?: Array<{
    field: string;
    operator: '<' | '<=' | '==' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any';
    value: any;
  }>;
}

// User Management
export const createOrUpdateUser = async (user: User): Promise<DBUser> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  const userData: DBUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous,
    createdAt: userDoc.exists() 
      ? userDoc.data().createdAt 
      : serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

export const getUser = async (uid: string): Promise<DBUser | null> => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() as DBUser : null;
};

// User Profile Management
export const createOrUpdateUserProfile = async (
  uid: string, 
  profile: Partial<UserProfile>
): Promise<UserProfile> => {
  const profileRef = doc(db, 'user_profiles', uid);
  const profileDoc = await getDoc(profileRef);
  
  const profileData: UserProfile = {
    uid,
    preferences: {
      genres: [],
      favoriteAuthors: [],
      readingSpeed: 'medium',
      preferredNarrators: [],
      ...profile.preferences,
    },
    settings: {
      emailNotifications: true,
      theme: 'system',
      language: 'en',
      ...profile.settings,
    },
    createdAt: profileDoc.exists() 
      ? profileDoc.data().createdAt 
      : serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(profileRef, profileData, { merge: true });
  return profileData;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const profileRef = doc(db, 'user_profiles', uid);
  const profileDoc = await getDoc(profileRef);
  return profileDoc.exists() ? profileDoc.data() as UserProfile : null;
};

// Submission Management
export const createOnboardingSubmission = async (
  uid: string,
  answers: Record<string, any>
): Promise<OnboardingSubmission> => {
  // Verify user exists
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  // Check for existing submission
  const submissionsRef = collection(db, 'onboarding_submissions');
  const q = query(submissionsRef, where('uid', '==', uid));
  const existingDocs = await getDocs(q);
  
  if (!existingDocs.empty) {
    const existingDoc = existingDocs.docs[0];
    const submission: OnboardingSubmission = {
      uid,
      answers: {
        ...existingDoc.data().answers,
        ...answers,
      },
      completed: true,
      createdAt: existingDoc.data().createdAt,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await updateDoc(doc(submissionsRef, existingDoc.id), submission);
    return submission;
  }

  const submission: OnboardingSubmission = {
    uid,
    answers,
    completed: true,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = doc(submissionsRef);
  await setDoc(docRef, submission);
  return submission;
};

export const createQuestionnaireSubmission = async (
  uid: string,
  questionnaireId: string,
  answers: Record<string, any>,
  score?: number
): Promise<QuestionnaireSubmission> => {
  // Verify user exists
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  // Check for existing submission
  const submissionsRef = collection(db, 'questionnaire_submissions');
  const q = query(
    submissionsRef, 
    where('uid', '==', uid),
    where('questionnaireId', '==', questionnaireId)
  );
  const existingDocs = await getDocs(q);
  
  if (!existingDocs.empty) {
    const existingDoc = existingDocs.docs[0];
    const submission: QuestionnaireSubmission = {
      uid,
      questionnaireId,
      answers: {
        ...existingDoc.data().answers,
        ...answers,
      },
      score,
      completed: true,
      createdAt: existingDoc.data().createdAt,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await updateDoc(doc(submissionsRef, existingDoc.id), submission);
    return submission;
  }

  const submission: QuestionnaireSubmission = {
    uid,
    questionnaireId,
    answers,
    score,
    completed: true,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = doc(submissionsRef);
  await setDoc(docRef, submission);
  return submission;
};

export const getOnboardingSubmission = async (uid: string): Promise<OnboardingSubmission | null> => {
  const submissionsRef = collection(db, 'onboarding_submissions');
  const q = query(submissionsRef, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].data() as OnboardingSubmission : null;
};

export const getQuestionnaireSubmission = async (
  uid: string,
  questionnaireId: string
): Promise<QuestionnaireSubmission | null> => {
  const submissionsRef = collection(db, 'questionnaire_submissions');
  const q = query(
    submissionsRef,
    where('uid', '==', uid),
    where('questionnaireId', '==', questionnaireId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].data() as QuestionnaireSubmission : null;
};

// Template Queries
export const getTemplates = async (
  options: QueryOptions = {}
): Promise<Template[]> => {
  try {
    const templatesRef = collection(db, 'templates');
    let q = query(templatesRef);

    // Apply where clauses
    if (options.where) {
      for (const condition of options.where) {
        q = query(q, where(condition.field, condition.operator, condition.value));
      }
    }

    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }

    // Apply pagination
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Template);
  } catch (error) {
    console.error('[Database] Error fetching templates:', error);
    throw error;
  }
};

export const getTemplatesByCategory = async (
  category: string,
  options: Omit<QueryOptions, 'where'> = {}
): Promise<Template[]> => {
  return getTemplates({
    ...options,
    where: [{ field: 'category', operator: '==', value: category }]
  });
};

export const getTemplatesByType = async (
  type: Template['type'],
  options: Omit<QueryOptions, 'where'> = {}
): Promise<Template[]> => {
  return getTemplates({
    ...options,
    where: [{ field: 'type', operator: '==', value: type }]
  });
};

// User Queries
export const searchUsers = async (
  options: QueryOptions = {}
): Promise<DBUser[]> => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef);

    if (options.where) {
      for (const condition of options.where) {
        q = query(q, where(condition.field, condition.operator, condition.value));
      }
    }

    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }) as DBUser);
  } catch (error) {
    console.error('[Database] Error searching users:', error);
    throw error;
  }
};

// Submission Queries
export const getUserSubmissions = async (
  uid: string,
  options: Omit<QueryOptions, 'where'> = {}
): Promise<{
  onboarding: OnboardingSubmission[];
  questionnaires: QuestionnaireSubmission[];
}> => {
  try {
    // Get onboarding submissions
    const onboardingRef = collection(db, 'onboarding_submissions');
    let onboardingQuery = query(onboardingRef, where('uid', '==', uid));

    if (options.orderBy) {
      onboardingQuery = query(onboardingQuery, 
        orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options.limit) {
      onboardingQuery = query(onboardingQuery, limit(options.limit));
    }

    // Get questionnaire submissions
    const questionnaireRef = collection(db, 'questionnaire_submissions');
    let questionnaireQuery = query(questionnaireRef, where('uid', '==', uid));

    if (options.orderBy) {
      questionnaireQuery = query(questionnaireQuery, 
        orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options.limit) {
      questionnaireQuery = query(questionnaireQuery, limit(options.limit));
    }

    const [onboardingSnapshot, questionnaireSnapshot] = await Promise.all([
      getDocs(onboardingQuery),
      getDocs(questionnaireQuery)
    ]);

    return {
      onboarding: onboardingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OnboardingSubmission[],
      questionnaires: questionnaireSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionnaireSubmission[]
    };
  } catch (error) {
    console.error('[Database] Error fetching user submissions:', error);
    throw error;
  }
};

export const searchSubmissions = async (
  type: 'onboarding' | 'questionnaire',
  options: QueryOptions = {}
): Promise<(OnboardingSubmission | QuestionnaireSubmission)[]> => {
  try {
    const collectionName = type === 'onboarding' 
      ? 'onboarding_submissions' 
      : 'questionnaire_submissions';
    
    const submissionsRef = collection(db, collectionName);
    let q = query(submissionsRef);

    if (options.where) {
      for (const condition of options.where) {
        q = query(q, where(condition.field, condition.operator, condition.value));
      }
    }

    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (OnboardingSubmission | QuestionnaireSubmission)[];
  } catch (error) {
    console.error('[Database] Error searching submissions:', error);
    throw error;
  }
};

// Metadata Queries
export const getSubmissionStats = async (uid: string): Promise<{
  totalSubmissions: number;
  completedSubmissions: number;
  averageScore?: number;
  submissionsByType: Record<string, number>;
}> => {
  try {
    const { questionnaires } = await getUserSubmissions(uid);
    
    const stats = {
      totalSubmissions: questionnaires.length,
      completedSubmissions: questionnaires.filter(s => s.completed).length,
      averageScore: undefined as number | undefined,
      submissionsByType: {} as Record<string, number>
    };

    // Calculate average score
    const scores = questionnaires
      .filter(s => s.score !== undefined)
      .map(s => s.score as number);
    
    if (scores.length > 0) {
      stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // Count submissions by type
    questionnaires.forEach(submission => {
      const type = submission.questionnaireId.split('_')[0];
      stats.submissionsByType[type] = (stats.submissionsByType[type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('[Database] Error calculating submission stats:', error);
    throw error;
  }
};
