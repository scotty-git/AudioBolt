import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Response } from '../../../types/response';

const submissionsRef = collection(db, COLLECTIONS.QUESTIONNAIRE_SUBMISSIONS);

export const submissionDb = {
  async create(submission: Response): Promise<void> {
    const docRef = doc(submissionsRef, submission.id);
    await setDoc(docRef, submission);
  },

  async getById(id: string): Promise<Response | null> {
    const docRef = doc(submissionsRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Response : null;
  },

  async getAll(): Promise<Response[]> {
    const querySnapshot = await getDocs(submissionsRef);
    return querySnapshot.docs.map(doc => doc.data() as Response);
  },

  async getByUserId(userId: string): Promise<Response[]> {
    const q = query(submissionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Response);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(submissionsRef, id));
  }
};