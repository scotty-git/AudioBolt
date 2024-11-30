# Database Architecture

## Overview
The application uses Firebase Firestore for data persistence, with IndexedDB as a fallback for offline capabilities. The database structure is designed to support user authentication, profile management, template management, onboarding flows, and questionnaire submissions with efficient querying and filtering capabilities.

## Core Collections

### Users Collection
```typescript
interface User {
  uid: string;              // Firebase Auth UID
  email: string;            // User's email
  displayName?: string;     // Optional display name
  photoURL?: string;        // Avatar URL
  emailVerified: boolean;   // Email verification status
  createdAt: Timestamp;     // Account creation date
  lastLogin: Timestamp;     // Last login timestamp
  metadata?: Record<string, any>;
}

Indexes:
- by-email: Quick lookup by email
- by-creation: Filter by creation date
- by-lastLogin: Monitor user activity
```

### User Profiles Collection
```typescript
interface UserProfile {
  uid: string;              // Firebase Auth UID
  avatarUrl?: string;       // Profile picture URL
  preferences: {
    genres: string[];       // Preferred genres
    readingSpeed: 'slow' | 'medium' | 'fast';
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
  };
  metadata: {
    lastUpdated: Timestamp;
    deviceInfo?: string;
    timezone?: string;
  };
}

Indexes:
- by-preferences: Filter by user preferences
- by-lastUpdate: Track profile updates
```

### Templates Collection
```typescript
interface Template {
  id: string;                 // UUID
  title: string;             // Template title
  type: 'onboarding' | 'questionnaire';
  content: string;           // JSON string of template content
  is_default: boolean;       // Whether this is the default template
  status: 'draft' | 'published' | 'archived';
  created_at: string;        // ISO datetime
  updated_at: string;        // ISO datetime
  version: string;           // Semantic version
  category?: string;         // Optional category
  tags?: string[];          // Optional tags
}

Indexes:
- by-type: Quick lookup by template type
- by-status: Filter templates by status
- by-date: Filter by creation date
```

### User Sessions Collection
```typescript
interface UserSession {
  uid: string;              // User ID
  sessionId: string;        // Session UUID
  device: {
    type: string;
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
  };
  startTime: Timestamp;
  lastActive: Timestamp;
  status: 'active' | 'expired';
  metadata?: Record<string, any>;
}

Indexes:
- by-user: Track user sessions
- by-status: Monitor active sessions
- by-lastActive: Clean up expired sessions
```

### Onboarding Submissions Collection
```typescript
interface OnboardingSubmission {
  id: string;
  userId: string;
  flowId: string;
  responses: Record<string, any>;
  progress: {
    completedSections: string[];
    skippedSections: string[];
    currentSectionId?: string;
    lastUpdated: Timestamp;
  };
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastUpdated: Timestamp;
  metadata?: Record<string, any>;
}
```

### Questionnaire Submissions Collection
```typescript
interface QuestionnaireSubmission {
  id: string;
  userId: string;
  templateId: string;
  answers: Record<string, any>;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastUpdated: Timestamp;
  status: 'in_progress' | 'completed' | 'abandoned';
  metadata?: Record<string, any>;
}
```

## Repository Pattern Implementation

### User Repository
```typescript
interface UserRepository {
  create(user: User): Promise<User>;
  findById(uid: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(uid: string, data: Partial<User>): Promise<User>;
  delete(uid: string): Promise<void>;
  updateLastLogin(uid: string): Promise<void>;
  verifyEmail(uid: string): Promise<void>;
}
```

### Profile Repository
```typescript
interface ProfileRepository {
  create(profile: UserProfile): Promise<UserProfile>;
  findById(uid: string): Promise<UserProfile | null>;
  update(uid: string, data: Partial<UserProfile>): Promise<UserProfile>;
  delete(uid: string): Promise<void>;
  updateAvatar(uid: string, url: string): Promise<void>;
  updatePreferences(uid: string, prefs: Partial<UserProfile['preferences']>): Promise<void>;
}
```

### Template Repository
```typescript
interface TemplateRepository {
  create(template: Template): Promise<Template>;
  findById(id: string): Promise<Template | null>;
  findByType(type: string): Promise<Template[]>;
  findAll(): Promise<Template[]>;
  update(id: string, template: Partial<Template>): Promise<Template>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  getDefaultTemplate(type: string): Promise<Template | null>;
  setDefault(id: string): Promise<Template>;
}
```

## Security Rules

### User Data Access
```javascript
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}

match /profiles/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}

match /sessions/{sessionId} {
  allow read: if request.auth.uid == resource.data.uid;
  allow write: if request.auth.uid == request.resource.data.uid;
}
```

## Debugging & Testing Infrastructure

### Debug Pages
- `/debug` - Main debugging dashboard
  - Firebase connection status
  - Collection statistics
  - Real-time data monitoring
  - User session tracking
  - Authentication status

### Testing Status

#### Completed Tests
- User authentication flows
- Profile management
- Template CRUD operations
- Basic submission handling
- Data validation
- Security rules

#### In Progress
- Complex filtering operations
- Bulk operations
- Performance optimization
- Session management
- Analytics integration

## Data Migration

### User Data Migration
```typescript
interface UserMigration {
  version: string;
  migrations: {
    [key: string]: (user: User) => Promise<User>;
  };
}
```

### Profile Data Migration
```typescript
interface ProfileMigration {
  version: string;
  migrations: {
    [key: string]: (profile: UserProfile) => Promise<UserProfile>;
  };
}
```

## Backup Strategy

### Regular Backups
- Daily user data backup
- Weekly full database backup
- Monthly archive creation

### Backup Verification
- Data integrity checks
- Restoration testing
- Version compatibility

## Performance Optimization

### Indexing Strategy
- Compound indexes for common queries
- Automatic index management
- Query performance monitoring

### Caching Layer
- Client-side caching
- Server-side caching
- Cache invalidation rules

## Security Measures

### Data Protection
- Field-level encryption
- Secure data transmission
- Access control policies
- Data retention policies

### Audit Trail
- User activity logging
- Security event tracking
- Error monitoring
- Performance metrics