import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { OnboardingSubmission } from '../types';

const onboardingRef = collection(db, COLLECTIONS.ONBOARDING_SUBMISSIONS);

export const onboardingDb = {
  async create(submission: Omit<OnboardingSubmission, 'startedAt' | 'lastUpdated'>): Promise<void> {
    const now = Timestamp.now();
    const submissionData: OnboardingSubmission = {
      ...submission,
      startedAt: now,
      lastUpdated: now,
      progress: {
        ...submission.progress,
        lastUpdated: now
      }
    };
    const docRef = doc(onboardingRef, submission.id);
    await setDoc(docRef, submissionData);
  },

  async getById(id: string): Promise<OnboardingSubmission | null> {
    const docRef = doc(onboardingRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as OnboardingSubmission : null;
  },

  async getByUserId(userId: string): Promise<OnboardingSubmission[]> {
    const q = query(onboardingRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as OnboardingSubmission);
  },

  async update(id: string, data: Partial<OnboardingSubmission>): Promise<void> {
    const docRef = doc(onboardingRef, id);
    await setDoc(docRef, {
      ...data,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }
};