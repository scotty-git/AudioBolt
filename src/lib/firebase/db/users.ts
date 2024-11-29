import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { FirebaseUser } from '../types';

const usersRef = collection(db, COLLECTIONS.USERS);

export const userDb = {
  async create(user: Omit<FirebaseUser, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = Timestamp.now();
    const userData: FirebaseUser = {
      ...user,
      createdAt: now,
      updatedAt: now
    };
    const docRef = doc(usersRef, user.id);
    await setDoc(docRef, userData);
  },

  async getById(id: string): Promise<FirebaseUser | null> {
    const docRef = doc(usersRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as FirebaseUser : null;
  },

  async getByEmail(email: string): Promise<FirebaseUser | null> {
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as FirebaseUser;
  },

  async update(id: string, data: Partial<FirebaseUser>): Promise<void> {
    const docRef = doc(usersRef, id);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
};