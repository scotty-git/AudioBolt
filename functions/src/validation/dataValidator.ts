import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { 
  ValidationResult, 
  ValidationError, 
  Template,
  buildResponseSchema,
  OPTIONAL_FIELDS_SCHEMA 
} from './schemas';

const db = getFirestore();

export class DataValidator {
  private static async validateForeignKeys(
    submission: FirebaseFirestore.DocumentSnapshot
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const data = submission.data();
    if (!data) return errors;

    // Check user exists
    const userRef = db.collection('users').doc(data.userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      errors.push({
        type: 'foreign_key',
        field: 'userId',
        message: `User ${data.userId} not found`,
        submissionId: submission.id,
        severity: 'error',
        timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
      });
    }

    // Check template exists
    const templateRef = db.collection('templates').doc(data.templateId);
    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      errors.push({
        type: 'foreign_key',
        field: 'templateId',
        message: `Template ${data.templateId} not found`,
        submissionId: submission.id,
        severity: 'error',
        timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
      });
    }

    return errors;
  }

  private static async validateResponseSchema(
    submission: FirebaseFirestore.DocumentSnapshot,
    template: Template
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const data = submission.data();
    if (!data) return errors;

    try {
      const responseSchema = buildResponseSchema(template);
      await responseSchema.validate(data.responses, { abortEarly: false });
    } catch (error) {
      if (error.inner) {
        error.inner.forEach((err: any) => {
          errors.push({
            type: 'schema',
            field: `responses.${err.path}`,
            message: err.message,
            submissionId: submission.id,
            severity: 'error',
            timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
          });
        });
      }
    }

    return errors;
  }

  private static async validateOptionalFields(
    submission: FirebaseFirestore.DocumentSnapshot
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const data = submission.data();
    if (!data) return errors;

    try {
      await OPTIONAL_FIELDS_SCHEMA.validate(data, { abortEarly: false });
    } catch (error) {
      if (error.inner) {
        error.inner.forEach((err: any) => {
          errors.push({
            type: 'optional_field',
            field: err.path,
            message: err.message,
            submissionId: submission.id,
            severity: 'warning',
            timestamp: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
          });
        });
      }
    }

    return errors;
  }

  static async validateSubmission(
    submissionId: string
  ): Promise<ValidationResult> {
    const submissionRef = db.collection('submissions').doc(submissionId);
    const submission = await submissionRef.get();

    if (!submission.exists) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const data = submission.data()!;
    const templateRef = db.collection('templates').doc(data.templateId);
    const template = (await templateRef.get()).data() as Template;

    const errors = [
      ...(await this.validateForeignKeys(submission)),
      ...(await this.validateResponseSchema(submission, template)),
      ...(await this.validateOptionalFields(submission))
    ];

    // Log validation errors
    if (errors.length > 0) {
      await this.logValidationErrors(errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async validateAllSubmissions(): Promise<ValidationResult[]> {
    const submissions = await db.collection('submissions').get();
    const results: ValidationResult[] = [];

    for (const submission of submissions.docs) {
      try {
        const result = await this.validateSubmission(submission.id);
        results.push(result);
      } catch (error) {
        console.error(`Error validating submission ${submission.id}:`, error);
      }
    }

    return results;
  }

  private static async logValidationErrors(errors: ValidationError[]): Promise<void> {
    const batch = db.batch();
    const validationLogsRef = db.collection('validation_logs');

    for (const error of errors) {
      const logRef = validationLogsRef.doc();
      batch.set(logRef, {
        ...error,
        timestamp: FieldValue.serverTimestamp()
      });

      // If error is severe, notify admins
      if (error.severity === 'error') {
        await this.notifyAdmins(error);
      }
    }

    await batch.commit();
  }

  private static async notifyAdmins(error: ValidationError): Promise<void> {
    const adminNotificationsRef = db.collection('admin_notifications');
    
    await adminNotificationsRef.add({
      type: 'validation_error',
      error,
      status: 'unread',
      timestamp: FieldValue.serverTimestamp()
    });
  }

  // Cleanup old validation logs
  static async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldLogs = await db.collection('validation_logs')
      .where('timestamp', '<', cutoffDate)
      .get();

    const batch = db.batch();
    oldLogs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
