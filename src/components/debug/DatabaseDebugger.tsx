import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { COLLECTIONS } from '../../lib/firebase/collections';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

interface CollectionData {
  id: string;
  data: any;
}

export const DatabaseDebugger: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Record<string, CollectionData[]>>({});

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const collectionData: Record<string, CollectionData[]> = {};

        // Fetch data from each collection
        for (const [key, value] of Object.entries(COLLECTIONS)) {
          const querySnapshot = await getDocs(collection(db, value));
          collectionData[key] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }));
        }

        setCollections(collectionData);
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium mb-2">Database Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-medium mb-2">Database Connected</h3>
        <p className="text-green-600">Firebase connection established successfully.</p>
      </div>

      {Object.entries(collections).map(([collectionName, documents]) => (
        <div key={collectionName} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="font-medium text-gray-900">
              {collectionName} ({documents.length} documents)
            </h3>
          </div>
          
          <div className="p-4 overflow-x-auto">
            {documents.length > 0 ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(documents, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 text-sm">No documents found in this collection.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};