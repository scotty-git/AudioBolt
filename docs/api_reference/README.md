# API Reference Documentation

## Overview
This directory contains detailed API documentation for all AudioBolt endpoints and services.

## Contents

### Core APIs
- [Submissions API](./submissions.md) - Complete documentation for the submissions management endpoints
  - Create, read, update operations
  - Bulk operations
  - Archival management
  - Version history

## API Standards

### Authentication
All APIs require Firebase Authentication tokens:
```http
Authorization: Bearer <firebase_id_token>
```

### Response Format
All APIs follow a consistent response format:
```json
{
  "data": {},      // Response data
  "meta": {},      // Metadata (pagination, etc.)
  "error": null    // Error details if any
}
```

### Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}  // Additional error context
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting
All APIs are subject to rate limiting:
- Default: 1000 requests/hour per IP
- Authenticated: 5000 requests/hour per user
- Bulk operations: 100 requests/hour per user

## Best Practices
1. Always include authentication tokens
2. Implement retry logic with exponential backoff
3. Handle rate limiting gracefully
4. Use appropriate page sizes for list operations
5. Implement proper error handling
