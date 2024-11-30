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

## Database Documentation

### Overview
AudioBolt uses Firebase Firestore as its primary database, implementing a scalable, secure, and performant data structure.

### Collections

### 1. Submissions
```typescript
interface Submission {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  created_at: Timestamp;
  updated_at: Timestamp;
  version: number;
  owner_id: string;
  metadata: {
    type: string;
    tags: string[];
    category: string;
  };
  history: VersionHistory[];
}

interface VersionHistory {
  timestamp: Timestamp;
  user_id: string;
  changes: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
}
```

### 2. Security Alerts
```typescript
interface SecurityAlert {
  id: string;
  type: 'unauthorized_access' | 'suspicious_rate_limit' | 'rule_bypass_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Timestamp;
  user_id?: string;
  ip?: string;
  description: string;
  metadata: Record<string, any>;
}
```

### 3. Rate Limits
```typescript
interface RateLimit {
  id: string;  // IP or user_id
  type: 'ip' | 'user';
  requests: {
    timestamp: Timestamp;
    endpoint: string;
    count: number;
  }[];
  blocked_until?: Timestamp;
}
```

### 4. Monitoring Metrics
```typescript
interface Metrics {
  id: string;
  timestamp: Timestamp;
  type: 'usage' | 'performance' | 'error';
  data: {
    value: number;
    endpoint?: string;
    operation?: string;
    latency?: number;
  };
  metadata: Record<string, any>;
}
```

## Data Operations

### 1. Submission Management

#### Create Submission
```typescript
async function createSubmission(data: Partial<Submission>): Promise<string> {
  const submission = {
    ...data,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    version: 1,
    status: 'draft',
    history: []
  };
  return await db.collection('submissions').add(submission);
}
```

#### Update Submission
```typescript
async function updateSubmission(
  id: string, 
  data: Partial<Submission>,
  user_id: string
): Promise<void> {
  const oldData = await getSubmission(id);
  const changes = compareChanges(oldData, data);
  
  await db.collection('submissions').doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
    version: FieldValue.increment(1),
    history: FieldValue.arrayUnion({
      timestamp: FieldValue.serverTimestamp(),
      user_id,
      changes
    })
  });
}
```

#### Archive Submission
```typescript
async function archiveSubmission(id: string): Promise<void> {
  await db.collection('submissions').doc(id).update({
    status: 'archived',
    updated_at: FieldValue.serverTimestamp()
  });
}
```

### 2. Bulk Operations

#### Batch Archive
```typescript
async function batchArchive(ids: string[]): Promise<void> {
  const batch = db.batch();
  const timestamp = FieldValue.serverTimestamp();
  
  ids.forEach(id => {
    const ref = db.collection('submissions').doc(id);
    batch.update(ref, {
      status: 'archived',
      updated_at: timestamp
    });
  });
  
  await batch.commit();
}
```

#### Batch Update
```typescript
async function batchUpdate(
  updates: { id: string; data: Partial<Submission> }[]
): Promise<void> {
  const batch = db.batch();
  const timestamp = FieldValue.serverTimestamp();
  
  updates.forEach(({ id, data }) => {
    const ref = db.collection('submissions').doc(id);
    batch.update(ref, {
      ...data,
      updated_at: timestamp,
      version: FieldValue.increment(1)
    });
  });
  
  await batch.commit();
}
```

## Indexing Strategy

### Single-Field Indexes
- status
- owner_id
- created_at
- updated_at
- version

### Composite Indexes
```
submissions_status_created    : status, created_at
submissions_owner_status     : owner_id, status
submissions_type_status      : metadata.type, status
submissions_category_status  : metadata.category, status
```

## Query Patterns

### 1. List Submissions
```typescript
// List with pagination
const pageSize = 20;
const lastDoc = await db.collection('submissions')
  .where('status', '!=', 'archived')
  .orderBy('created_at', 'desc')
  .limit(pageSize)
  .get();
```

### 2. Search Submissions
```typescript
// Search by multiple fields
const results = await db.collection('submissions')
  .where('status', '==', 'approved')
  .where('metadata.category', '==', category)
  .orderBy('updated_at', 'desc')
  .get();
```

### 3. Version History
```typescript
// Get version history
const history = await db.collection('submissions')
  .doc(id)
  .collection('history')
  .orderBy('timestamp', 'desc')
  .get();
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Submission rules
    match /submissions/{submissionId} {
      allow read: if isAuthenticated() && 
        (isOwner(resource.data) || isAdmin());
      allow create: if isAuthenticated() && 
        validateSubmission(request.resource.data);
      allow update: if isAuthenticated() && 
        (isOwner(resource.data) || isAdmin()) && 
        validateSubmission(request.resource.data);
      allow delete: if false;  // Soft delete only
    }
    
    // Security alert rules
    match /security_alerts/{alertId} {
      allow read: if isAdmin();
      allow write: if false;  // System only
    }
    
    // Rate limit rules
    match /rate_limits/{limitId} {
      allow read: if false;
      allow write: if false;  // System only
    }
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(data) {
      return data.owner_id == request.auth.uid;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function validateSubmission(data) {
      return data.keys().hasAll(['title', 'content', 'status']) &&
        data.status in ['draft', 'pending', 'approved', 'rejected', 'archived'];
    }
  }
}
```

## Maintenance

### 1. Cleanup Tasks
```typescript
// Clean old security alerts
async function cleanupSecurityAlerts(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const snapshot = await db.collection('security_alerts')
    .where('timestamp', '<', thirtyDaysAgo)
    .get();
    
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

### 2. Performance Optimization
- Use appropriate indexes
- Implement query caching
- Batch operations
- Limit query results
- Use composite indexes

### 3. Monitoring
- Track query performance
- Monitor collection sizes
- Check index usage
- Review security rules
- Analyze access patterns

## Best Practices

1. **Data Structure**
   - Use shallow documents
   - Avoid nested arrays
   - Keep document size small
   - Use appropriate data types

2. **Queries**
   - Use compound queries
   - Implement pagination
   - Cache results
   - Use appropriate indexes

3. **Security**
   - Validate all writes
   - Use security rules
   - Implement rate limiting
   - Track access patterns

4. **Maintenance**
   - Regular cleanup
   - Monitor performance
   - Update indexes
   - Review security rules