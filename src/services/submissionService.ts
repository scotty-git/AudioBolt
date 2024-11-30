import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Submission, SubmissionCreate, SubmissionUpdate, SubmissionStatus } from '../types/submission';

const COLLECTION = 'submissions';

export class SubmissionService {
  /**
   * Create a new submission
   */
  async createSubmission(data: SubmissionCreate): Promise<Submission> {
    const submissionRef = doc(collection(db, COLLECTION));
    
    const submission: Submission = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await submissionRef.set(submission);
    return submission;
  }

  /**
   * Get a submission by ID
   */
  async getSubmission(submissionId: string): Promise<Submission | null> {
    const docRef = doc(db, COLLECTION, submissionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Submission : null;
  }

  /**
   * Get submissions by user ID
   */
  async getUserSubmissions(userId: string): Promise<Submission[]> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Submission);
  }

  /**
   * Update a submission
   */
  async updateSubmission(
    submissionId: string, 
    data: SubmissionUpdate
  ): Promise<Submission> {
    const submissionRef = doc(db, COLLECTION, submissionId);
    const submission = await this.getSubmission(submissionId);
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    const updates: SubmissionUpdate = {
      ...data,
      updatedAt: Timestamp.now()
    };

    // If status is being updated to 'completed', add completedAt
    if (data.status === 'completed' && submission.status !== 'completed') {
      updates.completedAt = Timestamp.now();
    }

    await submissionRef.update(updates);
    return { ...submission, ...updates };
  }

  /**
   * Archive a submission
   */
  async archiveSubmission(submissionId: string): Promise<void> {
    await this.updateSubmission(submissionId, {
      status: 'archived',
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Batch archive submissions
   */
  async batchArchiveSubmissions(submissionIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    const updates = {
      status: 'archived' as SubmissionStatus,
      updatedAt: serverTimestamp()
    };

    submissionIds.forEach(id => {
      const ref = doc(db, COLLECTION, id);
      batch.update(ref, updates);
    });

    await batch.commit();
  }

  /**
   * Get submissions by template ID
   */
  async getSubmissionsByTemplate(
    templateId: string,
    status?: SubmissionStatus
  ): Promise<Submission[]> {
    let q = query(
      collection(db, COLLECTION),
      where('templateId', '==', templateId),
      orderBy('updatedAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Submission);
  }
}
