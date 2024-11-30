import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  SubmissionUpdateRequest,
  SubmissionUpdateError,
  SubmissionVersion,
  VALID_STATUS_TRANSITIONS
} from '../types/submissionUpdate';
import { Submission } from '../types/submission';

const db = getFirestore();

/**
 * Validates the update request data
 */
async function validateUpdateRequest(
  data: SubmissionUpdateRequest,
  currentSubmission: Submission,
  isAdmin: boolean
): Promise<void> {
  // Validate status transition
  if (data.status) {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentSubmission.status];
    if (!allowedTransitions.includes(data.status)) {
      throw new SubmissionUpdateError(
        `Invalid status transition from ${currentSubmission.status} to ${data.status}`,
        'invalid-status-transition',
        400,
        'status'
      );
    }
  }

  // Validate responses
  if (data.responses) {
    try {
      JSON.stringify(data.responses);
    } catch (error) {
      throw new SubmissionUpdateError(
        'Responses must be a valid JSON object',
        'invalid-responses',
        400,
        'responses'
      );
    }
  }

  // Validate templateId update (admin only)
  if (data.templateId && !isAdmin) {
    throw new SubmissionUpdateError(
      'Only admins can update templateId',
      'unauthorized',
      403,
      'templateId'
    );
  }

  // If templateId is being updated, verify it exists
  if (data.templateId) {
    const templateDoc = await db.collection('templates').doc(data.templateId).get();
    if (!templateDoc.exists) {
      throw new SubmissionUpdateError(
        'Template does not exist',
        'template-not-found',
        404,
        'templateId'
      );
    }
  }
}

/**
 * Creates a version history entry
 */
async function createVersionHistory(
  submissionId: string,
  currentData: Submission,
  userId: string,
  changes: Partial<Submission>
): Promise<void> {
  const versionDoc = db.collection('submissions')
    .doc(submissionId)
    .collection('version_history')
    .doc();

  const version: SubmissionVersion = {
    ...currentData,
    versionId: versionDoc.id,
    timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
    changedBy: userId,
    changeType: changes.status ? 'status' : 
                changes.responses ? 'responses' : 'template'
  };

  await versionDoc.set(version);
}

export const updateSubmission = functions.https.onCall(async (
  data: SubmissionUpdateRequest,
  context
) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to update submissions'
    );
  }

  try {
    const { submissionId, ...updates } = data;

    // Get the submission
    const submissionRef = db.collection('submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      throw new SubmissionUpdateError(
        'Submission not found',
        'not-found',
        404
      );
    }

    const currentSubmission = submissionDoc.data() as Submission;

    // Check permissions
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

    if (!isAdmin && currentSubmission.userId !== context.auth.uid) {
      throw new SubmissionUpdateError(
        'Not authorized to update this submission',
        'unauthorized',
        403
      );
    }

    // Validate the update request
    await validateUpdateRequest(updates, currentSubmission, isAdmin);

    // Prepare update data
    const updateData: Partial<Submission> = {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
      version: (currentSubmission.version || 0) + 1
    };

    // Add completedAt if status is being changed to 'completed'
    if (updates.status === 'completed') {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    // Perform update in a transaction
    await db.runTransaction(async (transaction) => {
      // Create version history
      await createVersionHistory(
        submissionId,
        currentSubmission,
        context.auth!.uid,
        updateData
      );

      // Update the submission
      transaction.update(submissionRef, updateData);
    });

    return {
      success: true,
      message: 'Submission updated successfully',
      submissionId
    };

  } catch (error) {
    console.error('Error updating submission:', error);

    if (error instanceof SubmissionUpdateError) {
      throw new functions.https.HttpsError(
        error.code as any,
        error.message,
        {
          field: error.field,
          code: error.code
        }
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while updating the submission'
    );
  }
});
