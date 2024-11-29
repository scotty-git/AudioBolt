import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { QuestionnaireSubmission } from '../types';

const questionnaireRef = collection(db, COLLECTIONS.QUESTIONNAIRE_SUBMISSIONS);

export const questionnaireDb = {
  async create(submission: Omit<QuestionnaireSubmission, 'startedAt' | 'lastUpdated'>): Promise<void> {
    const now = Timestamp.now();
    const submissionData: QuestionnaireSubmission = {
      ...submission,
      startedAt: now,
      lastUpdated: now
    };
    const docRef = doc(questionnaireRef, submission.id);
    await setDoc(docRef, submissionData);
  },

  async getById(id: string): Promise<QuestionnaireSubmission | null> {
    const docRef = doc(questionnaireRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as QuestionnaireSubmission : null;
  },

  async getByUserId(userId: string): Promise<QuestionnaireSubmission[]> {
    const q = query(questionnaireRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as QuestionnaireSubmission);
  },

  async update(id: string, data: Partial<QuestionnaireSubmission>): Promise<void> {
    const docRef = doc(questionnaireRef, id);
    await setDoc(docRef, {
      ...data,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  }
};