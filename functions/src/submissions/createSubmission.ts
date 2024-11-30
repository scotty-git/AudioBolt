import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import {
  CreateSubmissionRequest,
  Submission,
  SubmissionStatus,
  SubmissionError
} from '../types/submission';

const db = getFirestore();
const VALID_STATUSES: SubmissionStatus[] = ['in_progress', 'completed', 'archived'];

/**
 * Validates that a user exists
 */
async function validateUser(userId: string): Promise<void> {
  try {
    await getAuth().getUser(userId);
  } catch (error) {
    throw new SubmissionError(
      `User ${userId} does not exist`,
      'user-not-found',
      404,
      'userId'
    );
  }
}

/**
 * Validates that a template exists
 */
async function validateTemplate(templateId: string): Promise<void> {
  const templateDoc = await db.collection('templates').doc(templateId).get();
  if (!templateDoc.exists) {
    throw new SubmissionError(
      `Template ${templateId} does not exist`,
      'template-not-found',
      404,
      'templateId'
    );
  }
}

/**
 * Validates that the user has permission to create the submission
 */
async function validatePermissions(
  auth: functions.https.Request['auth'],
  userId: string
): Promise<void> {
  if (!auth) {
    throw new SubmissionError(
      'Authentication required',
      'unauthenticated',
      401
    );
  }

  // Check if user is admin
  const userDoc = await db.collection('users').doc(auth.uid).get();
  const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

  // Verify user is creating their own submission or is admin
  if (!isAdmin && auth.uid !== userId) {
    throw new SubmissionError(
      'Not authorized to create submission for other users',
      'unauthorized',
      403
    );
  }
}

/**
 * Validates the submission request data
 */
function validateSubmissionData(data: CreateSubmissionRequest): void {
  // Check required fields
  if (!data.userId) {
    throw new SubmissionError(
      'userId is required',
      'missing-field',
      400,
      'userId'
    );
  }

  if (!data.templateId) {
    throw new SubmissionError(
      'templateId is required',
      'missing-field',
      400,
      'templateId'
    );
  }

  if (!data.responses || typeof data.responses !== 'object') {
    throw new SubmissionError(
      'responses must be a valid object',
      'invalid-field',
      400,
      'responses'
    );
  }

  // Validate status if provided
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new SubmissionError(
      `status must be one of: ${VALID_STATUSES.join(', ')}`,
      'invalid-field',
      400,
      'status'
    );
  }
}

/**
 * Creates a new submission
 */
export const createSubmission = functions.https.onCall(async (data: CreateSubmissionRequest, context) => {
  try {
    // Validate request data
    validateSubmissionData(data);

    // Validate permissions
    await validatePermissions(context.auth, data.userId);

    // Validate foreign keys
    await Promise.all([
      validateUser(data.userId),
      validateTemplate(data.templateId)
    ]);

    // Prepare submission document
    const submission: Submission = {
      userId: data.userId,
      templateId: data.templateId,
      responses: data.responses,
      status: data.status || 'in_progress',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // Add completedAt if status is 'completed'
    if (submission.status === 'completed') {
      submission.completedAt = FieldValue.serverTimestamp();
    }

    // Create the submission
    const submissionRef = db.collection('submissions').doc();
    await submissionRef.set(submission);

    // Return the created submission ID
    return {
      id: submissionRef.id,
      success: true,
      message: 'Submission created successfully'
    };

  } catch (error) {
    if (error instanceof SubmissionError) {
      throw new functions.https.HttpsError(
        error.code as any,
        error.message,
        {
          field: error.field,
          code: error.code
        }
      );
    }

    // Log unexpected errors
    console.error('Unexpected error creating submission:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while creating the submission'
    );
  }
});

// Optional: Add a REST endpoint for the same functionality
export const createSubmissionHttp = functions.https.onRequest(async (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method not allowed' });
      return;
    }

    // Verify authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).send({ error: 'Authentication required' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Create context object similar to callable function
    const context = {
      auth: {
        uid: decodedToken.uid,
        token: decodedToken
      }
    };

    // Call the main function logic
    const result = await createSubmission(req.body, context);
    res.status(200).send(result);

  } catch (error) {
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).send({
        error: error.message,
        code: error.code,
        field: error.field
      });
      return;
    }

    console.error('Unexpected error in HTTP endpoint:', error);
    res.status(500).send({
      error: 'An unexpected error occurred',
      code: 'internal-error'
    });
  }
});
