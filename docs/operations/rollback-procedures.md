# Service Rollback Procedures

## Overview

This document outlines procedures for rolling back service configurations and handling service failures in MeetSolis.

## Emergency Rollback Scenarios

### Scenario 1: Service Provider Outage

**When to Use**: External service (Clerk, Supabase, OpenAI, etc.) experiences outage

**Immediate Response**:
1. **Activate Mock Services**
   ```bash
   # Set environment variable
   export USE_MOCK_SERVICES=true

   # For production deployment
   vercel env add USE_MOCK_SERVICES true production

   # Redeploy if necessary
   vercel --prod
   ```

2. **Update Service Configuration**
   ```javascript
   // Temporarily override service factory
   process.env.USE_MOCK_SERVICES = 'true';
   ServiceFactory.clearAllServices();
   ```

3. **User Notification**
   - Display maintenance banner
   - Inform users of limited functionality
   - Provide estimated restoration time

### Scenario 2: API Key Compromise

**When to Use**: API keys have been exposed or compromised

**Immediate Response**:
1. **Disable Compromised Keys**
   - Revoke keys in service provider dashboards
   - Remove from environment variables
   - Generate new keys

2. **Activate Temporary Fallback**
   ```bash
   # Enable mock services while rotating keys
   export USE_MOCK_SERVICES=true
   ```

3. **Key Rotation**
   ```bash
   # Update environment variables
   export CLERK_SECRET_KEY=new_key_here
   export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=new_public_key

   # Update in deployment platform
   vercel env add CLERK_SECRET_KEY new_key_here production
   ```

4. **Verification**
   - Test new keys in staging
   - Gradually re-enable real services
   - Monitor for any issues

### Scenario 3: Service Configuration Error

**When to Use**: Recent configuration changes caused service failures

**Immediate Response**:
1. **Identify Last Known Good Configuration**
   ```bash
   # Check git history for environment changes
   git log --oneline -10 -- .env.example

   # Check deployment history
   vercel deployments list
   ```

2. **Revert Configuration**
   ```bash
   # Revert to previous environment variables
   git checkout HEAD~1 -- .env.example

   # Or manually restore from backup
   cp .env.backup .env.local
   ```

3. **Redeploy Previous Version**
   ```bash
   # Redeploy specific commit
   vercel --prod --confirm

   # Or rollback via Vercel dashboard
   ```

## Service-Specific Rollback Procedures

### Clerk Authentication Rollback

**Issue**: Authentication service failing

**Rollback Steps**:
1. **Enable Mock Authentication**
   ```bash
   export USE_MOCK_SERVICES=true
   ```

2. **Preserve User Sessions**
   ```javascript
   // In middleware, temporarily bypass auth
   if (process.env.EMERGENCY_BYPASS === 'true') {
     return NextResponse.next();
   }
   ```

3. **User Communication**
   - Display "Login temporarily unavailable"
   - Allow guest access for public features
   - Preserve any ongoing sessions

4. **Gradual Recovery**
   - Fix authentication configuration
   - Test in staging environment
   - Re-enable for small user percentage
   - Full rollout after verification

### Supabase Database Rollback

**Issue**: Database connectivity or performance issues

**Rollback Steps**:
1. **Enable In-Memory Storage**
   ```bash
   export USE_MOCK_SERVICES=true
   ```

2. **Data Preservation**
   ```bash
   # If possible, export critical data
   supabase db dump --data-only > backup.sql
   ```

3. **Read-Only Mode**
   ```javascript
   // Allow reads from cache, disable writes
   const dbService = ServiceFactory.createDatabaseService();
   if (dbService.fallbackMode()) {
     // Show cached/static data only
   }
   ```

4. **Recovery Process**
   - Restore database connectivity
   - Verify data integrity
   - Re-enable write operations
   - Sync any missed updates

### OpenAI API Rollback

**Issue**: AI service failures or quota exceeded

**Rollback Steps**:
1. **Enable Template Responses**
   ```bash
   export USE_MOCK_SERVICES=true
   ```

2. **Feature Degradation**
   ```javascript
   // Disable AI features gracefully
   const showAISummary = !aiService.fallbackMode();

   if (!showAISummary) {
     return "Summary temporarily unavailable";
   }
   ```

3. **Alternative Solutions**
   - Use cached summaries from previous meetings
   - Provide manual summary templates
   - Implement basic keyword extraction

### Translation Service Rollback

**Issue**: DeepL API failures

**Rollback Steps**:
1. **Passthrough Mode**
   ```bash
   export USE_MOCK_SERVICES=true
   ```

2. **Language Fallback**
   ```javascript
   // Default to English for all content
   const translationService = ServiceFactory.createTranslationService();

   if (translationService.fallbackMode()) {
     return originalText; // No translation
   }
   ```

3. **User Options**
   - Inform users translation unavailable
   - Provide language selection for UI
   - Allow manual translation requests

## Deployment Rollback Procedures

### Vercel Deployment Rollback

**Full Application Rollback**:
1. **Via Vercel Dashboard**
   - Navigate to Deployments
   - Find last stable deployment
   - Click "Promote to Production"

2. **Via CLI**
   ```bash
   # List deployments
   vercel deployments list

   # Promote specific deployment
   vercel promote <deployment-url>
   ```

3. **Environment Variable Rollback**
   ```bash
   # Remove problematic variables
   vercel env rm PROBLEMATIC_VAR production

   # Add corrected variables
   vercel env add CORRECTED_VAR value production
   ```

### Database Migration Rollback

**Supabase Migration Issues**:
1. **Via Supabase Dashboard**
   - Navigate to Database > Migrations
   - Review migration history
   - Manually revert schema changes

2. **Via SQL**
   ```sql
   -- Manually revert schema changes
   DROP TABLE IF EXISTS problematic_table;
   ALTER TABLE existing_table DROP COLUMN IF EXISTS problematic_column;
   ```

3. **Data Recovery**
   ```bash
   # Restore from backup if needed
   supabase db reset --linked
   psql -f backup.sql
   ```

## Gradual Recovery Procedures

### Phased Service Restoration

**Phase 1: Internal Testing**
1. Enable services in development environment
2. Run full test suite
3. Verify all functionality works
4. Test with team members

**Phase 2: Staging Verification**
1. Deploy to staging environment
2. Test with production-like data
3. Verify performance metrics
4. Run load tests

**Phase 3: Gradual Production Rollout**
1. Enable for 5% of users
2. Monitor error rates and performance
3. Gradually increase to 25%, 50%, 100%
4. Monitor at each step

### Feature Flag Implementation

```javascript
// Use feature flags for gradual rollout
const useRealServices = {
  auth: process.env.ENABLE_REAL_AUTH === 'true',
  database: process.env.ENABLE_REAL_DB === 'true',
  ai: process.env.ENABLE_REAL_AI === 'true',
};

// Gradual enablement
const enableForUser = (userId: string, feature: string) => {
  const hash = hashUserId(userId);
  const percentage = parseInt(process.env[`${feature}_ROLLOUT_PERCENTAGE`] || '0');
  return (hash % 100) < percentage;
};
```

## Monitoring During Rollback

### Key Metrics to Watch

1. **Error Rates**
   - Overall application errors
   - Service-specific errors
   - User authentication failures

2. **Performance Metrics**
   - Response times
   - Database query performance
   - Third-party service latency

3. **User Experience**
   - Session duration
   - Feature usage rates
   - User complaint volume

### Alert Thresholds During Rollback

```yaml
# Stricter monitoring during rollback
error_rate_threshold: 2%      # Normal: 5%
response_time_threshold: 2s   # Normal: 5s
availability_threshold: 99.9% # Normal: 99.5%
```

### Rollback Success Criteria

**Service Restoration Checklist**:
- [ ] All health checks pass
- [ ] Error rates below normal thresholds
- [ ] Response times within acceptable limits
- [ ] All critical user flows working
- [ ] No user complaints about functionality
- [ ] Monitoring shows stable performance

## Communication Procedures

### Internal Communication

1. **Incident Declaration**
   ```
   INCIDENT: Service outage affecting [services]
   Impact: [user impact description]
   Actions: [immediate actions taken]
   ETA: [estimated resolution time]
   ```

2. **Status Updates**
   - Every 15 minutes during active incident
   - Include current status, actions taken, next steps
   - Update when rollback procedures are initiated

3. **Resolution Communication**
   ```
   RESOLVED: Service outage
   Resolution: [what was done]
   Root Cause: [brief explanation]
   Follow-up: [any additional actions needed]
   ```

### User Communication

1. **Status Page Updates**
   - Update status page immediately
   - Provide clear, non-technical explanations
   - Include estimated resolution times

2. **In-App Notifications**
   ```javascript
   // Show maintenance banner
   const MaintenanceBanner = () => (
     <div className="bg-yellow-100 border-yellow-400 text-yellow-700 px-4 py-3">
       Some features temporarily unavailable. We're working to restore full functionality.
     </div>
   );
   ```

3. **Email/SMS Notifications**
   - For major outages affecting all users
   - For extended maintenance windows
   - For resolution confirmations

## Post-Rollback Analysis

### Incident Review Process

1. **Timeline Documentation**
   - When issue was detected
   - When rollback was initiated
   - Key decision points
   - When services were restored

2. **Root Cause Analysis**
   - What caused the initial issue
   - Why rollback was necessary
   - What could have prevented it
   - What early warning signs were missed

3. **Improvement Actions**
   - Better monitoring/alerting
   - Improved rollback procedures
   - Additional testing requirements
   - Process improvements

### Documentation Updates

1. **Update Runbooks**
   - Incorporate lessons learned
   - Add new troubleshooting steps
   - Update contact information
   - Refine escalation procedures

2. **Improve Automation**
   - Automate manual rollback steps
   - Add circuit breaker improvements
   - Enhance monitoring coverage
   - Create better failover mechanisms

3. **Team Training**
   - Share incident learnings
   - Practice rollback procedures
   - Update emergency contact lists
   - Review communication protocols