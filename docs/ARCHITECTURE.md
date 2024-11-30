# Application Architecture

## Overview

The application follows a modular architecture with clear separation of concerns, designed to handle authentication, profile management, and template management in a secure and maintainable way.

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Shared components (buttons, inputs, etc.)
│   ├── auth/         # Authentication components
│   ├── profile/      # Profile management components
│   ├── feedback/     # Feedback components (loading, errors)
│   ├── layout/       # Layout components
│   └── templates/    # Template-specific components
├── hooks/            # Custom React hooks
│   ├── useAuth/      # Authentication hooks
│   ├── useProfile/   # Profile management hooks
│   └── useUpload/    # File upload hooks
├── pages/           # Main application views
├── lib/            # Core libraries and configurations
│   ├── firebase/   # Firebase configuration and utilities
│   └── db/         # Database abstractions
├── utils/           # Helper functions and utilities
└── types/           # TypeScript definitions
```

## Core Components

### Authentication System
- Firebase Authentication integration
- Secure token management
- Session handling
- Profile management
- Avatar upload system

### Firebase Integration
- Firestore for data persistence
- Authentication system
- Storage for avatars
- Real-time updates
- Offline capabilities

### Template Management
- Unified interface for managing onboarding flows and questionnaires
- Multi-select functionality for bulk operations
- Advanced filtering and search capabilities
- Responsive design with mobile-optimized views

### Component Architecture
1. Authentication Components
   - Login form
   - Registration form
   - Password reset
   - Profile management
   - Avatar upload

2. Template List View
   - Tabbed navigation
   - Search and filter functionality
   - Bulk selection and actions
   - Responsive table/card layout

3. Profile Management
   - Profile updates
   - Avatar management
   - Password changes
   - Preference settings
   - Account deletion

4. Filter System
   - Type-based filtering
   - Status filtering
   - Date range selection
   - Search by title

## State Management

### Authentication State
```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}
```

### Profile State
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
}
```

### Template State
```typescript
interface Template {
  id: string;
  title: string;
  type: 'onboarding' | 'questionnaire';
  content: string;
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  version: string;
}
```

### Firebase Integration
```typescript
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
```

## Component Patterns

### Authentication Components
- AuthProvider: Context provider for authentication state
- PrivateRoute: Protected route component
- LoginForm: Authentication form component
- ProfileForm: Profile management form
- AvatarUpload: File upload component

### Shared Components
- SelectableTable: Reusable table with multi-select
- MultiSelectActions: Bulk action controls
- DeleteConfirmationDialog: Reusable confirmation modal
- FilterDropdown: Advanced filtering interface

### Firebase Components
- FirebaseProvider: Context provider for Firebase
- FirebaseDebugger: Debugging interface
- AuthGuard: Authentication wrapper
- StorageUploader: File upload wrapper

### Mobile Optimization
- Card-based layout for small screens
- Touch-friendly controls
- Responsive dropdowns and modals
- Optimized file uploads

## Security Patterns

### Authentication
- Secure token management
- Session handling
- Password policies
- Rate limiting
- Error masking

### File Upload
- Type validation
- Size restrictions
- Malware scanning
- Secure URLs
- Cleanup processes

### Profile Management
- Input validation
- Data sanitization
- Access control
- Error handling
- Audit logging

## Performance Optimization

### Authentication
- Token caching
- Session persistence
- Lazy loading
- Error recovery
- Memory management

### File Upload
- Chunk uploading
- Progress tracking
- Retry mechanism
- Cache management
- Cleanup routines

### State Management
- Efficient updates
- Memory cleanup
- Type safety
- Error boundaries
- Loading states

## Development Guidelines

### Code Organization
- Feature-based structure
- Clear separation of concerns
- Type safety
- Error handling
- Documentation

### Security Best Practices
- Input validation
- Error masking
- Access control
- Secure storage
- Audit logging

### Performance Considerations
- Lazy loading
- Code splitting
- Memory management
- Cache optimization
- Error recovery