import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  ArchiveSubmissionRequest,
  BatchArchiveRequest,
  ArchiveError,
  ArchiveResult
} from '../types/archiveSubmission';
import { Submission } from '../types/submission';

const db = getFirestore();
const MAX_BATCH_SIZE = 500;

/**
 * Validates a single submission for archiving
 */
async function validateSubmission(
  submissionId: string,
  userId: string,
  isAdmin: boolean
): Promise<Submission> {
  const submissionRef = db.collection('submissions').doc(submissionId);
  const submissionDoc = await submissionRef.get();

  if (!submissionDoc.exists) {
    throw new ArchiveError(
      `Submission ${submissionId} not found`,
      'not-found',
      404,
      submissionId
    );
  }

  const submission = submissionDoc.data() as Submission;

  // Check if already archived
  if (submission.status === 'archived') {
    throw new ArchiveError(
      `Submission ${submissionId} is already archived`,
      'already-archived',
      400,
      submissionId
    );
  }

  // Check permissions
  if (!isAdmin && submission.userId !== userId) {
    throw new ArchiveError(
      `Not authorized to archive submission ${submissionId}`,
      'unauthorized',
      403,
      submissionId
    );
  }

  return submission;
}

/**
 * Archives a single submission
 */
async function archiveSingleSubmission(
  submissionId: string,
  userId: string,
  reason?: string
): Promise<ArchiveResult> {
  const submissionRef = db.collection('submissions').doc(submissionId);
  
  const updateData = {
    status: 'archived',
    updatedAt: FieldValue.serverTimestamp(),
    archivedAt: FieldValue.serverTimestamp(),
    archivedBy: userId,
    archiveReason: reason || null
  };

  await submissionRef.update(updateData);

  return {
    success: true,
    message: 'Submission archived successfully',
    submissionId,
    timestamp: updateData.archivedAt as FirebaseFirestore.Timestamp
  };
}

/**
 * Cloud Function to archive a single submission
 */
export const archiveSubmission = functions.https.onCall(async (
  data: ArchiveSubmissionRequest,
  context
) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to archive submissions'
    );
  }

  try {
    // Check if user is admin
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

    // Validate submission
    await validateSubmission(data.submissionId, context.auth.uid, isAdmin);

    // Archive submission
    const result = await archiveSingleSubmission(
      data.submissionId,
      context.auth.uid,
      data.reason
    );

    return result;

  } catch (error) {
    console.error('Error archiving submission:', error);

    if (error instanceof ArchiveError) {
      throw new functions.https.HttpsError(
        error.code as any,
        error.message,
        {
          submissionId: error.submissionId,
          code: error.code
        }
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while archiving the submission'
    );
  }
});

/**
 * Cloud Function to archive multiple submissions in batch
 */
export const batchArchiveSubmissions = functions.https.onCall(async (
  data: BatchArchiveRequest,
  context
) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to archive submissions'
    );
  }

  try {
    // Validate batch size
    if (data.submissionIds.length > MAX_BATCH_SIZE) {
      throw new ArchiveError(
        `Cannot archive more than ${MAX_BATCH_SIZE} submissions at once`,
        'batch-size-exceeded',
        400
      );
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

    // Validate all submissions first
    await Promise.all(
      data.submissionIds.map(id => 
        validateSubmission(id, context.auth!.uid, isAdmin)
      )
    );

    // Archive submissions in batches of 500
    const results: ArchiveResult[] = [];
    const batch = db.batch();
    let operationCount = 0;

    for (const submissionId of data.submissionIds) {
      const submissionRef = db.collection('submissions').doc(submissionId);
      
      batch.update(submissionRef, {
        status: 'archived',
        updatedAt: FieldValue.serverTimestamp(),
        archivedAt: FieldValue.serverTimestamp(),
        archivedBy: context.auth.uid,
        archiveReason: data.reason || null
      });

      operationCount++;

      // Commit batch when it reaches maximum size
      if (operationCount === MAX_BATCH_SIZE) {
        await batch.commit();
        operationCount = 0;
      }

      results.push({
        success: true,
        message: 'Submission archived successfully',
        submissionId,
        timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
      });
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    return {
      success: true,
      message: `Successfully archived ${results.length} submissions`,
      results
    };

  } catch (error) {
    console.error('Error in batch archive:', error);

    if (error instanceof ArchiveError) {
      throw new functions.https.HttpsError(
        error.code as any,
        error.message,
        {
          submissionId: error.submissionId,
          code: error.code
        }
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred during batch archive'
    );
  }
});
