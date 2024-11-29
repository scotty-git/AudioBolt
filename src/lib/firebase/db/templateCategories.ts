import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { TemplateCategory } from '../types';

const categoriesRef = collection(db, COLLECTIONS.TEMPLATE_CATEGORIES);

export const templateCategoryDb = {
  async create(category: Omit<TemplateCategory, 'created_at' | 'updated_at'>): Promise<void> {
    const now = Timestamp.now();
    const categoryData: TemplateCategory = {
      ...category,
      created_at: now,
      updated_at: now
    };
    const docRef = doc(categoriesRef, category.id);
    await setDoc(docRef, categoryData);
  },

  async getById(id: string): Promise<TemplateCategory | null> {
    const docRef = doc(categoriesRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as TemplateCategory : null;
  },

  async getAll(): Promise<TemplateCategory[]> {
    const querySnapshot = await getDocs(categoriesRef);
    return querySnapshot.docs.map(doc => doc.data() as TemplateCategory);
  },

  async getByName(name: string): Promise<TemplateCategory[]> {
    const q = query(categoriesRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TemplateCategory);
  },

  async update(id: string, data: Partial<TemplateCategory>): Promise<void> {
    const docRef = doc(categoriesRef, id);
    await setDoc(docRef, {
      ...data,
      updated_at: Timestamp.now()
    }, { merge: true });
  }
};