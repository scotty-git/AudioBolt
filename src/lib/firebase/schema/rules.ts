export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if false;
    }
    
    // User Profiles collection
    match /user_profiles/{profileId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow create: if isAuthenticated() && isOwner(request.resource.data.user_id);
      allow update: if isAuthenticated() && isOwner(resource.data.user_id);
      allow delete: if false;
    }
    
    // Template Categories collection
    match /template_categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admin can modify categories
    }
    
    // Templates collection
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admin can modify templates
    }
    
    // Submissions collections
    match /onboarding_submissions/{submissionId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && isOwner(resource.data.userId);
      allow delete: if false;
    }
    
    match /questionnaire_submissions/{submissionId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && isOwner(resource.data.userId);
      allow delete: if false;
    }
  }
}
`;