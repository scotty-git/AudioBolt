# Authentication System Documentation

## Overview
AudioBolt uses Firebase Authentication for user management, supporting both anonymous and email/password authentication methods. The system is designed to be secure, flexible, and developer-friendly, with comprehensive profile management and avatar storage capabilities.

## Features
- Anonymous authentication
- Email/password authentication
- User profile management with avatar support
- Profile settings and preferences
- Password change functionality
- Profile deletion
- Development mode support
- Comprehensive error handling
- Secure data access controls
- Firebase Storage integration

## Implementation Details

### 1. Authentication Service (`/src/lib/firebase/auth.ts`)
- `signInAnon()`: Anonymous user authentication
- `signIn(email, password)`: Email/password login
- `signUp(email, password, displayName?)`: New user registration
- `signOut()`: User logout
- `observeAuthState(callback)`: Real-time auth state monitoring
- `updateEmail(email)`: Email update functionality
- `updatePassword(password)`: Password update functionality

### 2. Storage Service (`/src/lib/firebase/storage.ts`)
- Avatar upload and management
- File type validation
- Size restrictions
- Secure URL generation

### 3. Custom Hooks
#### `useAuth` (`/src/hooks/useAuth.ts`)
- Authentication state management
- User context provider
- Error handling
- Loading states
- Memory leak prevention
- Clean unmount handling

#### `useUserProfile` (`/src/hooks/useUserProfile.ts`)
- Profile data management
- Avatar management
- Preferences handling
- Settings management

#### `useAvatarUpload` (`/src/hooks/useAvatarUpload.ts`)
- Avatar upload handling
- File validation
- Progress tracking
- Error handling

### 4. Security Rules (`/firestore.rules` & `/storage.rules`)
Comprehensive security rules ensuring:
- Users can only access their own data
- Required field validation
- Data integrity checks
- Type validation
- File type restrictions
- File size limits

## Data Models

### User Profile
```typescript
interface DBUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### User Profile
```typescript
interface UserProfile {
  uid: string;
  avatarUrl?: string;
  preferences: {
    genres: string[];
    readingSpeed: 'slow' | 'medium' | 'fast';
  };
  settings: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Components

### Profile Management
```typescript
// ProfilePage.tsx
const ProfilePage = () => {
  const { user, updateEmail } = useAuth();
  const { profile, updateProfile, deleteProfile } = useUserProfile();
  const { uploadAvatar } = useAvatarUpload();

  // Avatar upload
  const handleAvatarUpload = async (file: File) => {
    const downloadURL = await uploadAvatar(file, user.uid);
    await updateProfile({ ...profile, avatarUrl: downloadURL });
  };

  // Profile update
  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    await updateProfile(data);
  };

  // Profile deletion
  const handleDeleteProfile = async () => {
    await deleteProfile();
  };
};
```

## Security Considerations
1. All database access requires authentication
2. Users can only access their own data
3. Required fields are validated
4. Data types are strictly enforced
5. Sensitive operations are restricted
6. File uploads are validated and restricted
7. Proper error masking
8. Secure state management
9. Memory leak prevention
10. Clean unmount handling

## Environment Variables
Required Firebase configuration:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Error Handling
The system provides comprehensive error handling for:
- Authentication errors
- Profile update errors
- File upload errors
- Network errors
- Validation errors

Error messages are user-friendly and properly masked for security.

## Loading States
All operations provide proper loading states:
- Authentication loading
- Profile loading
- Avatar upload loading
- Update operations loading

## Future Enhancements
1. Social authentication integration
2. Multi-factor authentication
3. Email verification
4. Password reset functionality
5. Session management
6. Activity logging
7. Enhanced security measures

## Best Practices
1. Always use proper cleanup in hooks
2. Implement proper loading states
3. Handle errors appropriately
4. Validate all inputs
5. Restrict file uploads
6. Use proper type safety
7. Implement proper navigation
8. Handle edge cases
9. Provide user feedback
10. Follow security guidelines
