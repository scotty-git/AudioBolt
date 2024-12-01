# Application Architecture

## Overview

The application follows a client-side architecture with IndexedDB for data persistence. It's designed to handle both onboarding flows and questionnaires in a modular, maintainable way.

## Core Components

### Database Layer (IndexedDB)
```typescript
interface AppDB extends DBSchema {
  templates: {
    key: string;
    value: Template;
    indexes: {
      'by-type': string;
      'by-status': string;
    };
  };
  responses: {
    key: string;
    value: Response;
    indexes: {
      'by-template': string;
      'by-user': string;
    };
  };
}
```

### Template Management
- Builder interface for template creation
- Template versioning and status management
- JSON-based template structure
- Zod schema validation

### Response Handling
- User response collection
- Progress tracking
- Response validation
- Metadata management

## Data Models

### Template Schema
```typescript
const templateSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['onboarding', 'questionnaire']),
  content: z.string(), // JSON string of template content
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.string(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  category: z.string().optional(),
  tags: z.string().optional(), // JSON array string
});
```

### Response Schema
```typescript
const responseSchema = z.object({
  id: z.string(),
  template_id: z.string(),
  user_id: z.string(),
  answers: z.string(), // JSON string of answers
  started_at: z.string(),
  completed_at: z.string().optional(),
  last_updated: z.string(),
  metadata: z.string().optional(), // JSON string for additional data
});
```

## Repository Pattern

The application uses the repository pattern to abstract database operations:

```typescript
interface TemplateRepository {
  create(template: Template): Promise<Template>;
  findById(id: string): Promise<Template | null>;
  findByType(type: string): Promise<Template[]>;
  findAll(): Promise<Template[]>;
  update(id: string, template: Partial<Template>): Promise<Template>;
  delete(id: string): Promise<void>;
  getDefaultTemplate(type: string): Promise<Template | null>;
  setDefault(id: string): Promise<Template>;
}
```

## Component Architecture

### Page Components
- HomePage: Entry point and navigation
- OnboardingBuilder: Template creation interface
- UserOnboarding: User-facing onboarding flow
- QuestionnaireSelection: Template selection interface
- QuestionnairePage: User-facing questionnaire
- TemplateManagementPage: Template administration
- DebugPage: Development tools and testing

### Shared Components
- Layout: Common page structure
- ErrorBoundary: Error handling wrapper
- AuthProvider: User context management
- Form components: Reusable input elements

## State Management

- React Context for global state
- Local component state with hooks
- IndexedDB for persistence
- Repository pattern for data access

## Error Handling

1. Database Operations
   - Connection handling
   - Transaction management
   - Schema validation
   - Fallback mechanisms

2. User Actions
   - Input validation
   - Form validation
   - Error boundaries
   - Loading states

## Testing Strategy

1. Unit Tests
   - Component testing
   - Hook testing
   - Repository testing
   - Schema validation

2. Integration Tests
   - User flows
   - Database operations
   - Form submissions
   - Error handling

## Performance Considerations

1. Data Management
   - Efficient IndexedDB queries
   - Optimized renders
   - Lazy loading
   - Schema validation

2. UI Optimization
   - Component memoization
   - Efficient state updates
   - Form optimization
   - Error boundary usage

## Future Considerations

1. Planned Features
   - Remote database integration
   - User authentication
   - Real-time updates
   - Data synchronization

2. Scalability
   - Migration to remote database
   - Authentication integration
   - Enhanced offline support
   - Data backup strategies