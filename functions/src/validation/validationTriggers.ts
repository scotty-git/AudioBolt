import * as functions from 'firebase-functions';
import { DataValidator } from './dataValidator';

// Run validation on submission creation/update
export const validateSubmission = functions.firestore
  .document('submissions/{submissionId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return; // Skip deletions

    try {
      const result = await DataValidator.validateSubmission(context.params.submissionId);
      
      // Update submission metadata with validation status
      await change.after.ref.update({
        validationStatus: {
          isValid: result.isValid,
          lastChecked: functions.firestore.FieldValue.serverTimestamp(),
          errorCount: result.errors.length
        }
      });
    } catch (error) {
      console.error('Validation failed:', error);
      throw new functions.https.HttpsError('internal', 'Validation failed');
    }
  });

// Run full validation check daily
export const dailyValidation = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const results = await DataValidator.validateAllSubmissions();
      
      // Generate validation summary
      const summary = {
        timestamp: functions.firestore.FieldValue.serverTimestamp(),
        totalChecked: results.length,
        totalValid: results.filter(r => r.isValid).length,
        totalInvalid: results.filter(r => !r.isValid).length,
        errorsByType: results.reduce((acc, result) => {
          result.errors.forEach(error => {
            acc[error.type] = (acc[error.type] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>)
      };

      // Store validation summary
      await functions.firestore().collection('validation_summaries').add(summary);

      // Cleanup old logs
      await DataValidator.cleanupOldLogs();

      return summary;
    } catch (error) {
      console.error('Daily validation failed:', error);
      throw new functions.https.HttpsError('internal', 'Daily validation failed');
    }
  });

// Admin endpoint to trigger validation manually
export const triggerValidation = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can trigger validation'
    );
  }

  try {
    const results = await DataValidator.validateAllSubmissions();
    return {
      success: true,
      results: results.map(r => ({
        isValid: r.isValid,
        errorCount: r.errors.length,
        errors: r.errors.map(e => ({
          type: e.type,
          field: e.field,
          message: e.message
        }))
      }))
    };
  } catch (error) {
    console.error('Manual validation failed:', error);
    throw new functions.https.HttpsError('internal', 'Manual validation failed');
  }
});
