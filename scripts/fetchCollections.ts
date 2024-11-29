import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env') });

import { 
  collection, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/nodeConfig';
import { COLLECTIONS } from '../src/lib/firebase/collections';

const formatTimestamp = (timestamp: Timestamp) => {
  return timestamp ? new Date(timestamp.seconds * 1000).toISOString() : 'N/A';
};

const fetchCollection = async (collectionName: string) => {
  try {
    console.log(`\n📦 Fetching documents from ${collectionName}:`);
    console.log('=' .repeat(50));

    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName}`);
      return;
    }

    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Document ${index + 1}:`);
      console.log(`ID: ${doc.id}`);
      
      // Iterate through all fields
      Object.entries(data).forEach(([key, value]) => {
        // Special handling for timestamps
        if (value instanceof Timestamp) {
          console.log(`${key}: ${formatTimestamp(value)}`);
        } 
        // Special handling for objects and arrays
        else if (typeof value === 'object') {
          console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
        }
        // Regular fields
        else {
          console.log(`${key}: ${value}`);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
  }
};

const init = async () => {
  try {
    // Fetch template categories
    await fetchCollection(COLLECTIONS.TEMPLATE_CATEGORIES);
    
    // Fetch templates
    await fetchCollection(COLLECTIONS.TEMPLATES);

    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

init();
