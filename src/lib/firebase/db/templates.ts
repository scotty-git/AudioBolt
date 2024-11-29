import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Template } from '../../../types/common';

const templatesRef = collection(db, COLLECTIONS.TEMPLATES);

export const templateDb = {
  async create(template: Template): Promise<void> {
    const docRef = doc(templatesRef, template.id);
    await setDoc(docRef, template);
  },

  async getById(id: string): Promise<Template | null> {
    const docRef = doc(templatesRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Template : null;
  },

  async getAll(): Promise<Template[]> {
    const querySnapshot = await getDocs(templatesRef);
    return querySnapshot.docs.map(doc => doc.data() as Template);
  },

  async getByType(type: Template['type']): Promise<Template[]> {
    const q = query(templatesRef, where('type', '==', type));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Template);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(templatesRef, id));
  }
};