import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../../lib/firebase/config';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

export const FirebaseDebugger: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Check if Firebase is initialized
        if (!isFirebaseInitialized()) {
          throw new Error('Firebase is not properly initialized');
        }

        // Try to list collections
        const snapshot = await getDocs(collection(db, 'users'));
        setCollections(['users', 'onboarding_submissions', 'questionnaire_submissions']);
        setStatus('connected');
      } catch (err) {
        console.error('Firebase connection error:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to Firebase');
        setStatus('error');
      }
    };

    checkFirebase();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium mb-2">Firebase Connection Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-medium mb-2">Firebase Connected</h3>
        <p className="text-green-600">Firebase has been successfully initialized and connected.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-2">Available Collections</h3>
        <ul className="list-disc list-inside space-y-1">
          {collections.map(collection => (
            <li key={collection} className="text-gray-600">{collection}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};