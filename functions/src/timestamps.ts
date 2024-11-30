import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Helper function to add timestamps
const addTimestamps = async (
  snapshot: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
) => {
  const data = snapshot.data();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Only add timestamps if they don't exist
  if (!data.createdAt) {
    await snapshot.ref.update({
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await snapshot.ref.update({
      updatedAt: now,
    });
  }
};

// Create timestamp triggers for each collection
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(addTimestamps);

export const onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    return change.after.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onProfileCreate = functions.firestore
  .document('profiles/{userId}')
  .onCreate(addTimestamps);

export const onProfileUpdate = functions.firestore
  .document('profiles/{userId}')
  .onUpdate((change, context) => {
    return change.after.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onTemplateCreate = functions.firestore
  .document('templates/{templateId}')
  .onCreate(addTimestamps);

export const onTemplateUpdate = functions.firestore
  .document('templates/{templateId}')
  .onUpdate((change, context) => {
    return change.after.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onOnboardingSubmissionCreate = functions.firestore
  .document('onboarding_submissions/{submissionId}')
  .onCreate(addTimestamps);

export const onOnboardingSubmissionUpdate = functions.firestore
  .document('onboarding_submissions/{submissionId}')
  .onUpdate((change, context) => {
    return change.after.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

export const onQuestionnaireSubmissionCreate = functions.firestore
  .document('questionnaire_submissions/{submissionId}')
  .onCreate(addTimestamps);

export const onQuestionnaireSubmissionUpdate = functions.firestore
  .document('questionnaire_submissions/{submissionId}')
  .onUpdate((change, context) => {
    return change.after.ref.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
