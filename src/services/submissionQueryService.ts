import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  Query,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Submission } from '../types/submission';
import {
  SubmissionQueryOptions,
  SubmissionQueryResult,
  SubmissionQueryToken
} from '../types/submissionQuery';

const COLLECTION_NAME = 'submissions';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class SubmissionQueryService {
  /**
   * Create a base query with filters
   */
  private createBaseQuery(options: SubmissionQueryOptions): Query<DocumentData> {
    const submissionsRef = collection(db, COLLECTION_NAME);
    let baseQuery = query(submissionsRef);

    // Apply filters
    if (options.userId) {
      baseQuery = query(baseQuery, where('userId', '==', options.userId));
    }

    if (options.status) {
      baseQuery = query(baseQuery, where('status', '==', options.status));
    }

    if (options.templateId) {
      baseQuery = query(baseQuery, where('templateId', '==', options.templateId));
    }

    // Apply sorting
    const sortField = options.sortField || 'completedAt';
    const sortDirection = options.sortDirection || 'desc';
    
    baseQuery = query(baseQuery, orderBy(sortField, sortDirection));
    
    // Add secondary sort by createdAt if not already sorting by it
    if (sortField !== 'createdAt') {
      baseQuery = query(baseQuery, orderBy('createdAt', 'desc'));
    }

    return baseQuery;
  }

  /**
   * Create page token for next query
   */
  private createPageToken(
    lastDoc: QuerySnapshot<DocumentData>,
    options: SubmissionQueryOptions,
    pageSize: number
  ): string | undefined {
    if (lastDoc.empty || lastDoc.docs.length < pageSize) {
      return undefined;
    }

    const lastDocument = lastDoc.docs[lastDoc.docs.length - 1];
    const lastData = lastDocument.data();

    const token: SubmissionQueryToken = {
      lastDoc: {
        completedAt: lastData.completedAt?.toDate?.()?.toISOString() || null,
        createdAt: lastData.createdAt.toDate().toISOString(),
        id: lastDocument.id
      },
      filters: {
        userId: options.userId,
        status: options.status,
        templateId: options.templateId
      },
      pageSize,
      sortField: options.sortField || 'completedAt',
      sortDirection: options.sortDirection || 'desc'
    };

    return Buffer.from(JSON.stringify(token)).toString('base64');
  }

  /**
   * Decode page token
   */
  private decodePageToken(token: string): SubmissionQueryToken {
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (error) {
      throw new Error('Invalid page token');
    }
  }

  /**
   * Query submissions with pagination
   */
  async querySubmissions(
    options: SubmissionQueryOptions
  ): Promise<SubmissionQueryResult<Submission>> {
    // Validate and normalize page size
    const pageSize = Math.min(
      options.pageSize || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    // Create base query
    let submissionQuery = this.createBaseQuery(options);

    // Apply pagination
    if (options.pageToken) {
      const token = this.decodePageToken(options.pageToken);
      const { lastDoc } = token;

      // Validate token matches current query parameters
      if (
        token.filters.userId !== options.userId ||
        token.filters.status !== options.status ||
        token.filters.templateId !== options.templateId ||
        token.sortField !== options.sortField ||
        token.sortDirection !== options.sortDirection
      ) {
        throw new Error('Invalid page token for current query parameters');
      }

      // Create start point for pagination
      const startAfterValues = [
        lastDoc.completedAt ? new Date(lastDoc.completedAt) : null,
        new Date(lastDoc.createdAt)
      ];

      submissionQuery = query(
        submissionQuery,
        startAfter(...startAfterValues)
      );
    }

    // Apply limit
    submissionQuery = query(submissionQuery, limit(pageSize));

    // Execute query
    const [snapshot, countSnapshot] = await Promise.all([
      getDocs(submissionQuery),
      getCountFromServer(this.createBaseQuery(options))
    ]);

    // Transform results
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Submission[];

    // Create next page token
    const nextPageToken = this.createPageToken(snapshot, options, pageSize);

    return {
      items: submissions,
      nextPageToken,
      total: countSnapshot.data().count,
      hasMore: !!nextPageToken
    };
  }

  /**
   * Get submission count
   */
  async getSubmissionCount(options: SubmissionQueryOptions): Promise<number> {
    const baseQuery = this.createBaseQuery(options);
    const snapshot = await getCountFromServer(baseQuery);
    return snapshot.data().count;
  }
}
