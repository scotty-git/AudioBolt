import * as functions from 'firebase-functions';
import * as yup from 'yup';
import { BulkOperationsService } from './bulkOperations';

// Validation schemas
const archiveRequestSchema = yup.object({
  targetIds: yup.array().of(yup.string()),
  filters: yup.object({
    lastActiveDate: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/),
    status: yup.array().of(yup.string()),
    templateIds: yup.array().of(yup.string())
  }),
  options: yup.object({
    dryRun: yup.boolean(),
    batchSize: yup.number().min(1).max(500),
    reason: yup.string(),
    force: yup.boolean()
  })
}).test(
  'hasTarget',
  'Either targetIds or filters must be provided',
  value => !!(value.targetIds?.length || value.filters)
);

const updateRequestSchema = yup.object({
  targetIds: yup.array().of(yup.string()),
  filters: yup.object({
    status: yup.array().of(yup.string()),
    templateIds: yup.array().of(yup.string()),
    metadata: yup.object()
  }),
  updates: yup.object({
    status: yup.string(),
    metadata: yup.object()
  }).required(),
  options: yup.object({
    dryRun: yup.boolean(),
    batchSize: yup.number().min(1).max(500),
    reason: yup.string()
  })
}).test(
  'hasTarget',
  'Either targetIds or filters must be provided',
  value => !!(value.targetIds?.length || value.filters)
);

// Rate limiting middleware
const rateLimit = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  // Check if user is admin
  const userDoc = await functions.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  // Check rate limits
  const recentOps = await functions.firestore()
    .collection('bulk_operations')
    .where('createdBy', '==', context.auth.uid)
    .where('createdAt', '>', new Date(Date.now() - 3600000)) // Last hour
    .get();

  if (recentOps.size >= 10) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded: maximum 10 bulk operations per hour'
    );
  }
};

// Endpoint to bulk archive submissions
export const bulkArchiveSubmissions = functions.https.onCall(async (data, context) => {
  await rateLimit(context);

  try {
    await archiveRequestSchema.validate(data);
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }

  try {
    return await BulkOperationsService.bulkArchiveSubmissions(
      context.auth!.uid,
      data
    );
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Endpoint to bulk update submissions
export const bulkUpdateSubmissions = functions.https.onCall(async (data, context) => {
  await rateLimit(context);

  try {
    await updateRequestSchema.validate(data);
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }

  try {
    return await BulkOperationsService.bulkUpdateSubmissions(
      context.auth!.uid,
      data
    );
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Endpoint to get operation status
export const getBulkOperationStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const operationDoc = await functions.firestore()
    .collection('bulk_operations')
    .doc(data.operationId)
    .get();

  if (!operationDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Operation not found'
    );
  }

  const operation = operationDoc.data()!;
  
  // Only creator and admins can view operation status
  if (operation.createdBy !== context.auth.uid) {
    const userDoc = await functions.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Access denied'
      );
    }
  }

  return operation;
});
