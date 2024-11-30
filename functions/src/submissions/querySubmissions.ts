import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface QueryOptions {
  userId?: string;
  status?: 'in_progress' | 'completed' | 'archived';
  templateId?: string;
  pageSize?: number;
  pageToken?: string;
  sortField?: 'completedAt' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export const querySubmissions = functions.https.onCall(async (data: QueryOptions, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to query submissions'
    );
  }

  try {
    // Check if user is admin
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

    // Validate user access
    if (!isAdmin && data.userId && data.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Can only query your own submissions'
      );
    }

    // Build query
    let query = db.collection('submissions');

    // Apply filters
    if (!isAdmin || data.userId) {
      query = query.where('userId', '==', data.userId || context.auth.uid);
    }

    if (data.status) {
      query = query.where('status', '==', data.status);
    }

    if (data.templateId) {
      query = query.where('templateId', '==', data.templateId);
    }

    // Apply sorting
    const sortField = data.sortField || 'completedAt';
    const sortDirection = data.sortDirection || 'desc';
    query = query.orderBy(sortField, sortDirection);

    // Add secondary sort if not already sorting by createdAt
    if (sortField !== 'createdAt') {
      query = query.orderBy('createdAt', 'desc');
    }

    // Handle pagination
    const pageSize = Math.min(
      data.pageSize || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    if (data.pageToken) {
      try {
        const decodedToken = JSON.parse(
          Buffer.from(data.pageToken, 'base64').toString()
        );
        const startAfterDoc = await db.collection('submissions')
          .doc(decodedToken.lastDocId)
          .get();
          
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      } catch (error) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid page token'
        );
      }
    }

    // Apply limit
    query = query.limit(pageSize);

    // Execute query
    const snapshot = await query.get();

    // Get total count (for admin only to avoid expensive operations)
    let total = 0;
    if (isAdmin) {
      const countSnapshot = await query.count().get();
      total = countSnapshot.data().count;
    }

    // Format results
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Generate next page token if there are more results
    let nextPageToken: string | undefined;
    if (submissions.length === pageSize) {
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      nextPageToken = Buffer.from(
        JSON.stringify({ lastDocId: lastDoc.id })
      ).toString('base64');
    }

    return {
      items: submissions,
      nextPageToken,
      total: isAdmin ? total : undefined,
      hasMore: !!nextPageToken
    };

  } catch (error) {
    console.error('Error querying submissions:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while querying submissions'
    );
  }
});
