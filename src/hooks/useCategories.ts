import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { COLLECTIONS } from '../lib/firebase/collections';

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

// Custom hook for fetching categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Create a query to fetch categories, ordered by sort_order
        const categoriesRef = collection(db, COLLECTIONS.TEMPLATE_CATEGORIES);
        const q = query(categoriesRef, orderBy('sort_order', 'asc'));
        
        // Execute query
        const querySnapshot = await getDocs(q);
        
        // Transform documents
        const fetchedCategories: Category[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Category));
        
        setCategories(fetchedCategories);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};
