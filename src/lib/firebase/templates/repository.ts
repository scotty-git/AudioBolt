import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../core/services';
import { Template } from './types';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'templates';

export const templatesRepository = {
  async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const templatesRef = collection(db, COLLECTION_NAME);
    const now = new Date().toISOString();
    
    const templateData: Template = {
      id: uuidv4(),
      ...template,
      created_at: now,
      updated_at: now,
    };

    const docRef = await addDoc(templatesRef, templateData);
    return docRef.id;
  },

  async findAll(): Promise<Template[]> {
    const templatesRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => doc.data() as Template);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async update(id: string, data: Partial<Template>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  },
};