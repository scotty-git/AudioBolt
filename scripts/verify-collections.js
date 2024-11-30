import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Collection schemas
const schemas = {
  users: {
    email: 'string',
    displayName: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    lastLoginAt: 'timestamp',
    isAdmin: 'boolean'
  },
  user_profiles: {
    userId: 'string',
    bio: 'string',
    preferences: 'object',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  templates: {
    title: 'string',
    type: 'string',
    content: 'string', // JSON string
    status: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  onboarding_submissions: {
    userId: 'string',
    responses: 'object',
    status: 'string',
    completedAt: 'timestamp',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  questionnaire_submissions: {
    userId: 'string',
    responses: 'object',
    status: 'string',
    completedAt: 'timestamp',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  user_sessions: {
    userId: 'string',
    status: 'string',
    lastActive: 'timestamp',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }
};

// Verify field types
function getFieldType(value) {
  if (value instanceof admin.firestore.Timestamp) return 'timestamp';
  return typeof value;
}

async function verifyCollections() {
  for (const [collectionName, schema] of Object.entries(schemas)) {
    console.log(`\nVerifying collection: ${collectionName}`);
    
    try {
      const snapshot = await db.collection(collectionName).limit(5).get();
      
      if (snapshot.empty) {
        console.log(`⚠️  No documents found in ${collectionName}`);
        continue;
      }

      snapshot.forEach(doc => {
        console.log(`\nDocument ${doc.id}:`);
        const data = doc.data();
        
        // Check required fields
        for (const [field, expectedType] of Object.entries(schema)) {
          if (!(field in data)) {
            console.log(`❌ Missing required field: ${field}`);
            continue;
          }
          
          const actualType = getFieldType(data[field]);
          if (actualType !== expectedType) {
            console.log(`❌ Field ${field}: expected ${expectedType}, got ${actualType}`);
          } else {
            console.log(`✅ Field ${field}: ${expectedType}`);
          }
        }
      });
    } catch (error) {
      console.error(`Error verifying ${collectionName}:`, error);
    }
  }
}

verifyCollections();
