# AudioBolt Submission API Documentation

## Overview
The Submission API provides endpoints for managing submissions in the AudioBolt system. All endpoints are implemented as Firebase Cloud Functions and require authentication.

## Authentication
All requests require a valid Firebase Authentication token. Include the token in the Authorization header:
```typescript
firebase.functions().httpsCallable('functionName')(data);
```

## Rate Limits
- Create Submission: 20 requests per minute per user
- Query Submissions: 15 requests per second per user

## Endpoints

### Create Submission
Creates a new submission.

**Function Name:** `createSubmission`

**Request:**
```typescript
{
  templateId: string;
  responses: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  submissionId: string;
  message: string;
}
```

**Error Codes:**
- `invalid-argument`: Invalid input data
- `not-found`: Template not found
- `permission-denied`: Unauthorized access
- `resource-exhausted`: Rate limit exceeded

**Example:**
```typescript
const result = await firebase.functions()
  .httpsCallable('createSubmission')({
    templateId: 'template123',
    responses: { question1: 'answer1' }
  });
```

### Query Submissions
Retrieves submissions with filtering and pagination.

**Function Name:** `querySubmissions`

**Request:**
```typescript
{
  userId?: string;
  status?: 'in_progress' | 'completed' | 'archived';
  templateId?: string;
  pageSize?: number;
  pageToken?: string;
  sortField?: 'completedAt' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  items: Submission[];
  nextPageToken?: string;
  total?: number;
  hasMore: boolean;
}
```

**Error Codes:**
- `invalid-argument`: Invalid query parameters
- `permission-denied`: Unauthorized access
- `resource-exhausted`: Rate limit exceeded

**Example:**
```typescript
const result = await firebase.functions()
  .httpsCallable('querySubmissions')({
    status: 'completed',
    pageSize: 20
  });
```

### Update Submission
Updates an existing submission.

**Function Name:** `updateSubmission`

**Request:**
```typescript
{
  submissionId: string;
  responses?: Record<string, any>;
  status?: 'in_progress' | 'completed' | 'archived';
  templateId?: string; // Admin only
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  submissionId: string;
}
```

**Error Codes:**
- `invalid-argument`: Invalid update data
- `not-found`: Submission not found
- `permission-denied`: Unauthorized access
- `failed-precondition`: Invalid status transition

**Example:**
```typescript
const result = await firebase.functions()
  .httpsCallable('updateSubmission')({
    submissionId: 'sub123',
    status: 'completed'
  });
```

### Archive Submission
Archives a submission or batch of submissions.

**Function Name:** `archiveSubmission` or `batchArchiveSubmissions`

**Single Archive Request:**
```typescript
{
  submissionId: string;
  reason?: string;
}
```

**Batch Archive Request:**
```typescript
{
  submissionIds: string[];
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  submissionId: string;
  timestamp: Timestamp;
}
```

**Error Codes:**
- `not-found`: Submission not found
- `permission-denied`: Unauthorized access
- `already-exists`: Already archived
- `invalid-argument`: Invalid batch size

**Example:**
```typescript
// Single archive
const result = await firebase.functions()
  .httpsCallable('archiveSubmission')({
    submissionId: 'sub123',
    reason: 'Project completed'
  });

// Batch archive
const batchResult = await firebase.functions()
  .httpsCallable('batchArchiveSubmissions')({
    submissionIds: ['sub1', 'sub2'],
    reason: 'Bulk cleanup'
  });
```

## Data Types

### Submission
```typescript
interface Submission {
  id: string;
  userId: string;
  templateId: string;
  responses: Record<string, any>;
  status: 'in_progress' | 'completed' | 'archived';
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version?: number;
}
```

### Version History
```typescript
interface SubmissionVersion {
  versionId: string;
  timestamp: Timestamp;
  changedBy: string;
  changeType: 'status' | 'responses' | 'template';
  // Previous state data
}
```

## Error Handling
All endpoints return standard Firebase Cloud Function errors:
```typescript
interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}
```

Common error codes:
- `unauthenticated`: No valid authentication
- `permission-denied`: Insufficient permissions
- `invalid-argument`: Invalid input data
- `not-found`: Resource not found
- `resource-exhausted`: Rate limit exceeded
- `failed-precondition`: Operation prerequisites not met
- `internal`: Internal server error

## Best Practices
1. Always handle errors appropriately
2. Implement proper retry logic for rate limits
3. Use pagination for large result sets
4. Keep submission responses reasonably sized
5. Monitor query performance using logs
