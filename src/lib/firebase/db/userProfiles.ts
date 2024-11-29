import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { UserProfile } from '../types';

const profilesRef = collection(db, COLLECTIONS.USER_PROFILES);

export const userProfileDb = {
  async create(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<void> {
    const now = Timestamp.now();
    const profileData: UserProfile = {
      ...profile,
      created_at: now,
      updated_at: now
    };
    const docRef = doc(profilesRef, profile.id);
    await setDoc(docRef, profileData);
  },

  async getById(id: string): Promise<UserProfile | null> {
    const docRef = doc(profilesRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  },

  async getByUserId(userId: string): Promise<UserProfile | null> {
    const q = query(profilesRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as UserProfile;
  },

  async update(id: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(profilesRef, id);
    await setDoc(docRef, {
      ...data,
      updated_at: Timestamp.now()
    }, { merge: true });
  }
};