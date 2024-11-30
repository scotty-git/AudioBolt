# Troubleshooting Guide

## Common Issues and Solutions

### 1. Rate Limiting Issues

#### Symptoms
- 429 Too Many Requests errors
- Sudden request failures
- Blocked IP or user account

#### Solutions
1. **Check Rate Limits**
   ```bash
   # View current rate limits
   firebase functions:config:get rate_limits
   ```

2. **Implement Retry Logic**
   ```typescript
   async function retryWithBackoff(
     fn: () => Promise<any>,
     maxRetries = 3,
     baseDelay = 1000
   ) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.code === 429) {
           const delay = baseDelay * Math.pow(2, i);
           await new Promise(resolve => setTimeout(resolve, delay));
           continue;
         }
         throw error;
       }
     }
   }
   ```

3. **Batch Operations**
   ```typescript
   // Instead of multiple single requests
   const batchSize = 500;
   const chunks = _.chunk(items, batchSize);
   for (const chunk of chunks) {
     await processBatch(chunk);
   }
   ```

### 2. Authentication Issues

#### Symptoms
- 401 Unauthorized errors
- Token validation failures
- Session expiration

#### Solutions
1. **Check Token Expiration**
   ```typescript
   firebase.auth().currentUser?.getIdTokenResult()
     .then((token) => {
       console.log('Token expires:', token.expirationTime);
       console.log('Token claims:', token.claims);
     });
   ```

2. **Force Token Refresh**
   ```typescript
   await firebase.auth().currentUser?.getIdToken(true);
   ```

3. **Verify Permissions**
   ```typescript
   const userDoc = await db.collection('users')
     .doc(userId)
     .get();
   console.log('User role:', userDoc.data()?.role);
   ```

### 3. Validation Errors

#### Symptoms
- 400 Bad Request errors
- Schema validation failures
- Invalid field values

#### Solutions
1. **Check Schema**
   ```typescript
   import * as yup from 'yup';
   
   const schema = yup.object().shape({
     title: yup.string().required().max(200),
     content: yup.string().required().max(50000),
     metadata: yup.object().shape({
       type: yup.string().required().oneOf(['type1', 'type2']),
       category: yup.string().required(),
       tags: yup.array().of(yup.string().max(50)).max(10)
     })
   });
   
   try {
     await schema.validate(data);
   } catch (error) {
     console.error('Validation error:', error.errors);
   }
   ```

2. **Data Sanitization**
   ```typescript
   function sanitizeSubmission(data: any) {
     return {
       title: String(data.title).trim(),
       content: String(data.content).trim(),
       metadata: {
         type: String(data.metadata.type).toLowerCase(),
         category: String(data.metadata.category).toLowerCase(),
         tags: (data.metadata.tags || [])
           .map((tag: string) => tag.trim().toLowerCase())
           .filter(Boolean)
           .slice(0, 10)
       }
     };
   }
   ```

### 4. Performance Issues

#### Symptoms
- Slow query responses
- High latency
- Timeout errors

#### Solutions
1. **Query Optimization**
   ```typescript
   // Add appropriate indexes
   const indexConfig = {
     "indexes": [{
       "collectionGroup": "submissions",
       "queryScope": "COLLECTION",
       "fields": [
         { "fieldPath": "status", "order": "ASCENDING" },
         { "fieldPath": "created_at", "order": "DESCENDING" }
       ]
     }]
   };
   ```

2. **Implement Caching**
   ```typescript
   const cache = new Map();
   const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
   
   async function getCachedData(key: string) {
     const cached = cache.get(key);
     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
       return cached.data;
     }
     
     const data = await fetchData(key);
     cache.set(key, {
       data,
       timestamp: Date.now()
     });
     return data;
   }
   ```

3. **Monitor Performance**
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   
   await logMetric({
     type: 'performance',
     operation: 'query_submissions',
     duration
   });
   ```

### 5. Bulk Operation Issues

#### Symptoms
- Partial failures
- Timeout errors
- Inconsistent states

#### Solutions
1. **Implement Batching**
   ```typescript
   async function safeBatchOperation(
     items: any[],
     operation: (batch: any[]) => Promise<void>,
     batchSize = 500
   ) {
     const results = {
       success: [] as string[],
       failed: [] as { id: string; error: string }[]
     };
     
     const batches = _.chunk(items, batchSize);
     for (const batch of batches) {
       try {
         await operation(batch);
         results.success.push(...batch.map(item => item.id));
       } catch (error) {
         results.failed.push(...batch.map(item => ({
           id: item.id,
           error: error.message
         })));
       }
     }
     
     return results;
   }
   ```

2. **Transaction Safety**
   ```typescript
   async function safeTransaction(
     operation: (transaction: FirebaseFirestore.Transaction) => Promise<void>
   ) {
     const maxAttempts = 3;
     let attempt = 0;
     
     while (attempt < maxAttempts) {
       try {
         await db.runTransaction(operation);
         break;
       } catch (error) {
         if (attempt === maxAttempts - 1) throw error;
         await new Promise(resolve => 
           setTimeout(resolve, Math.pow(2, attempt) * 1000)
         );
         attempt++;
       }
     }
   }
   ```

### 6. Security Rule Issues

#### Symptoms
- Permission denied errors
- Unexpected access restrictions
- Rule evaluation failures

#### Solutions
1. **Test Rules Locally**
   ```bash
   # Install Firebase Emulator
   firebase init emulators
   
   # Start emulator
   firebase emulators:start
   
   # Run security rules tests
   firebase emulators:exec "npm test"
   ```

2. **Debug Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Add debug logging
       function debug(msg) {
         return msg;  // Visible in Rules Playground
       }
       
       match /submissions/{id} {
         allow read: if debug('Reading submission ' + id) && 
           isAuthenticated() &&
           debug('User: ' + request.auth.uid);
       }
     }
   }
   ```

## Authentication Issues

### Login Problems
1. **Invalid Credentials**
   - Verify email format
   - Check password
   - Use password reset if needed
   - Check for account existence

2. **Account Access**
   - Check email verification status
   - Verify account not disabled
   - Check for rate limiting
   - Review recent activity

3. **Password Reset**
   - Check email spam folder
   - Verify reset link expiration
   - Request new reset link if expired
   - Contact support if persistent

### Session Issues
1. **Token Problems**
   - Clear browser cache
   - Sign out and back in
   - Check network connection
   - Verify correct Firebase config

2. **Offline Access**
   - Check network status
   - Verify IndexedDB support
   - Clear local storage if needed
   - Review sync status

## Real-time Updates

### Sync Problems
1. **Data Not Updating**
   - Check network connection
   - Verify permissions
   - Review subscription status
   - Check for rate limiting

2. **Offline Mode**
   - Verify IndexedDB support
   - Check storage quota
   - Review pending changes
   - Force sync if needed

### Performance Issues
1. **Slow Updates**
   - Check network speed
   - Review query optimization
   - Verify index usage
   - Monitor rate limits

2. **Memory Usage**
   - Check browser resources
   - Review subscription cleanup
   - Monitor memory leaks
   - Clear cache if needed

## Common Error Messages

### Authentication Errors
- "Invalid email format": Check email syntax
- "Wrong password": Use reset password flow
- "User not found": Verify account exists
- "Too many attempts": Wait and retry later
- "Invalid reset link": Request new reset link

### Permission Errors
- "Permission denied": Check user role
- "Insufficient access": Review permissions
- "Rate limit exceeded": Wait and retry
- "Invalid operation": Verify action allowed

### Network Errors
- "Network unavailable": Check connection
- "Operation failed": Retry action
- "Sync failed": Check offline mode
- "Update conflict": Resolve conflicts

## Monitoring and Alerts

### 1. Set Up Monitoring
```typescript
// Configure alert thresholds
await db.collection('monitoring_config').doc('alerts').set({
  thresholds: {
    error_rate: 0.05,    // 5% error rate
    latency_p95: 1000,   // 1 second
    rate_limit: 0.8      // 80% of limit
  }
});
```

### 2. Configure Alerts
```typescript
// Set up alert channels
await db.collection('monitoring_config').doc('channels').set({
  email: ['alerts@domain.com'],
  slack: 'webhook_url',
  pagerduty: 'integration_key'
});
```

## Maintenance Tasks

### 1. Regular Cleanup
```bash
# Schedule cleanup function
0 0 * * * curl -X POST https://region-project.cloudfunctions.net/cleanup
```

### 2. Index Management
```bash
# Deploy updated indexes
firebase deploy --only firestore:indexes
```

### 3. Security Rules Update
```bash
# Test and deploy rules
firebase deploy --only firestore:rules
```

## Support Contacts

- Technical Issues: tech-support@audiobolt.com
- Security Issues: security@audiobolt.com
- Emergency: +1-xxx-xxx-xxxx (24/7)

## Development Mode

### Testing Issues
1. **Emulator Setup**
   - Verify correct ports
   - Check emulator running
   - Review config settings
   - Clear emulator data

2. **Authentication Testing**
   - Use test accounts
   - Check emulator auth
   - Verify test rules
   - Review test logs

## Contact Support

### Reporting Issues
- **Email**: support@audiobolt.com
- **Documentation**: docs.audiobolt.com
- **Status Page**: status.audiobolt.com
- **Emergency**: +1-xxx-xxx-xxxx

### Required Information
1. Error message
2. Steps to reproduce
3. Browser/device info
4. Network status
5. Account details (if applicable)
6. Screenshots (if available)
