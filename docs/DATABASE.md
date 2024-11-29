# Database Architecture

## Overview
The application uses Firebase Firestore for data persistence, with IndexedDB as a fallback for offline capabilities. The database structure is designed to support template management, onboarding flows, and questionnaire submissions with efficient querying and filtering capabilities.

## Core Collections

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

## Debugging & Testing Infrastructure

### Debug Pages
- `/debug` - Main debugging dashboard
  - Firebase connection status
  - Collection statistics
  - Real-time data monitoring

### Testing Status

#### Completed Tests
- Template CRUD operations
- Basic submission handling
- Authentication flows
- Data validation

#### In Progress
- Complex filtering operations
- Bulk operations
- Performance optimization

#### Known Issues
- Occasional race conditions in concurrent updates
- Performance bottlenecks in large dataset filtering
- Offline sync edge cases

## Best Practices

### Data Access
1. Always use repository pattern
2. Implement proper error handling
3. Validate data before storage
4. Use transactions for related operations

### Security
1. Implement proper Firebase security rules
2. Validate user permissions
3. Sanitize user input
4. Handle sensitive data appropriately

### Performance
1. Use appropriate indexes
2. Implement pagination
3. Optimize queries
4. Cache frequently accessed data

## Error Handling

```typescript
class FirebaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FirebaseError';
  }
}
```

## Migration Strategies

1. Version tracking in documents
2. Batch updates for schema changes
3. Fallback mechanisms
4. Data validation during migration

## Offline Support

1. IndexedDB fallback
2. Queue system for offline operations
3. Conflict resolution strategies
4. Sync status tracking

## Monitoring & Debugging

1. Firebase Debug View (`/debug`)
2. Error tracking
3. Performance monitoring
4. User session analysis

## Future Considerations

1. Sharding for large datasets
2. Advanced caching strategies
3. Real-time collaboration features
4. Enhanced offline capabilities