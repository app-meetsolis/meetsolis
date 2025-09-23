# Service Troubleshooting Guide

## Overview

This guide helps diagnose and resolve issues with external service dependencies in MeetSolis.

## Quick Diagnostics

### Health Check Commands

```bash
# Check overall system health
curl http://localhost:3000/api/health

# Check specific services
curl http://localhost:3000/api/health/auth
curl http://localhost:3000/api/health/database

# View service dashboard
# Navigate to http://localhost:3000/admin/services
```

### Log Analysis

```bash
# Check application logs
npm run logs

# Check specific service errors
grep "ERROR" logs/app.log | grep "auth"
grep "ERROR" logs/app.log | grep "database"
```

## Service-Specific Troubleshooting

### Clerk Authentication Issues

**Symptoms**:
- Users cannot log in
- Session expires immediately
- Authentication redirects fail

**Common Causes & Solutions**:

1. **Invalid API Keys**
   ```bash
   # Verify keys are set
   echo $CLERK_SECRET_KEY
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

   # Check key format
   # Secret key should start with: sk_
   # Publishable key should start with: pk_
   ```

2. **Domain Mismatch**
   - Check Clerk dashboard allowed origins
   - Verify development/production URLs match
   - Update redirect URLs in Clerk settings

3. **Middleware Configuration**
   - Check `middleware.ts` configuration
   - Verify protected routes are properly defined
   - Test middleware bypass for public routes

**Resolution Steps**:
1. Verify API keys in Clerk dashboard
2. Check browser network tab for 401/403 errors
3. Test with mock auth service: `USE_MOCK_SERVICES=true`
4. Review Clerk integration logs

### Supabase Database Issues

**Symptoms**:
- Database connection timeouts
- Query failures
- Real-time subscriptions not working

**Common Causes & Solutions**:

1. **Connection Issues**
   ```bash
   # Test connection
   curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/' \
     -H 'apikey: YOUR_ANON_KEY'
   ```

2. **RLS Policy Problems**
   - Check Row Level Security policies
   - Verify user permissions
   - Test queries in Supabase SQL editor

3. **Network/Firewall**
   - Check if Supabase domains are accessible
   - Verify no corporate firewall blocking
   - Test from different networks

**Resolution Steps**:
1. Check Supabase project status dashboard
2. Verify database URL and keys
3. Test with mock database: `USE_MOCK_SERVICES=true`
4. Review SQL query logs in Supabase

### OpenAI API Issues

**Symptoms**:
- Summary generation fails
- Quota exceeded errors
- Slow response times

**Common Causes & Solutions**:

1. **API Key Issues**
   ```bash
   # Test API key
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Quota/Billing**
   - Check OpenAI usage dashboard
   - Verify payment method
   - Review rate limits

3. **Request Format**
   - Verify prompt formatting
   - Check token limits (4096 for GPT-3.5)
   - Review request parameters

**Resolution Steps**:
1. Check OpenAI API status page
2. Verify quota and billing status
3. Test with mock AI service
4. Reduce prompt length if needed

### DeepL Translation Issues

**Symptoms**:
- Translation requests fail
- Character limit exceeded
- Unsupported language errors

**Common Causes & Solutions**:

1. **API Key Validation**
   ```bash
   # Test API key
   curl -X POST 'https://api-free.deepl.com/v2/translate' \
     -H 'Authorization: DeepL-Auth-Key YOUR_KEY' \
     -d 'text=Hello' \
     -d 'target_lang=DE'
   ```

2. **Character Limits**
   - Check DeepL account usage
   - Verify plan limits
   - Implement text chunking for long content

3. **Language Support**
   - Verify source/target language codes
   - Check DeepL supported languages list
   - Handle unsupported language fallback

**Resolution Steps**:
1. Check DeepL account dashboard
2. Verify character usage and limits
3. Test with mock translation service
4. Implement graceful fallback

### Twilio SMS Issues

**Symptoms**:
- SMS delivery failures
- Invalid phone number errors
- Webhook delivery issues

**Common Causes & Solutions**:

1. **Phone Number Format**
   ```bash
   # Valid formats
   +1234567890  # International format required
   # Invalid: (123) 456-7890, 123-456-7890
   ```

2. **Account Configuration**
   - Verify Twilio phone number ownership
   - Check account balance
   - Review messaging service configuration

3. **Delivery Issues**
   - Check carrier filtering
   - Verify recipient phone number
   - Review delivery status webhooks

**Resolution Steps**:
1. Check Twilio console logs
2. Verify account status and balance
3. Test with mock SMS service
4. Use Twilio debugger for failed messages

### Google Calendar API Issues

**Symptoms**:
- OAuth flow failures
- Calendar read/write errors
- Event creation failures

**Common Causes & Solutions**:

1. **OAuth Configuration**
   - Verify redirect URIs in Google Console
   - Check OAuth consent screen status
   - Update authorized domains

2. **Permissions**
   - Verify calendar API is enabled
   - Check OAuth scopes requested
   - Review user consent status

3. **API Quotas**
   - Check Google Console quota usage
   - Verify request rate limits
   - Review daily usage limits

**Resolution Steps**:
1. Check Google Cloud Console API dashboard
2. Verify OAuth configuration
3. Test with mock calendar service
4. Review Google API error codes

## Circuit Breaker Troubleshooting

### Circuit Breaker States

- **Closed**: Normal operation
- **Open**: Service failing, requests blocked
- **Half-Open**: Testing if service recovered

### Checking Circuit Breaker Status

```bash
# Check via API
curl http://localhost:3000/api/health/services

# Check in dashboard
# Navigate to Service Dashboard and look for Circuit Breaker column
```

### Resetting Circuit Breakers

```javascript
// Via service instance
const authService = ServiceFactory.createAuthService();
authService.resetCircuitBreaker();

// Via API (if implemented)
POST /api/admin/circuit-breaker/reset
{
  "service": "auth"
}
```

## Performance Issues

### Slow Response Times

**Diagnostics**:
1. Check service health dashboard response times
2. Review network latency to external services
3. Monitor database query performance
4. Check for rate limiting

**Solutions**:
1. Implement request caching
2. Optimize database queries
3. Add request timeouts
4. Consider service geography/regions

### High Error Rates

**Diagnostics**:
1. Review error logs and patterns
2. Check service status pages
3. Monitor error tracking (Sentry)
4. Analyze failure patterns

**Solutions**:
1. Implement better error handling
2. Add retry logic with backoff
3. Enable fallback modes
4. Scale service resources

## Environment-Specific Issues

### Development Environment

**Common Issues**:
- Mixed HTTP/HTTPS requests
- CORS errors with external services
- Environment variable loading issues

**Solutions**:
- Use consistent protocol (HTTP in dev)
- Configure proper CORS settings
- Verify `.env.local` file loading

### Production Environment

**Common Issues**:
- Environment variable synchronization
- Service region latency
- SSL/TLS certificate issues

**Solutions**:
- Use deployment environment variable management
- Choose optimal service regions
- Monitor SSL certificate expiration

## Emergency Procedures

### Service Outage Response

1. **Immediate Assessment**
   - Check service health dashboard
   - Identify affected services
   - Assess user impact

2. **Fallback Activation**
   ```bash
   # Enable mock services temporarily
   export USE_MOCK_SERVICES=true
   # Restart application
   ```

3. **Communication**
   - Update status page
   - Notify users via in-app messaging
   - Coordinate with team

4. **Recovery**
   - Monitor service recovery
   - Gradually re-enable real services
   - Verify full functionality

### Escalation Procedures

**Level 1 - Team Resolution**:
- Check known issues and troubleshooting steps
- Test with mock services
- Review recent changes

**Level 2 - Service Provider Support**:
- Contact service provider support
- Provide error logs and diagnostics
- Check service status pages

**Level 3 - Emergency Response**:
- Activate full fallback mode
- Implement temporary workarounds
- Coordinate with stakeholders

## Monitoring and Alerting

### Key Metrics to Monitor

- Service response times
- Error rates by service
- Circuit breaker state changes
- API quota usage
- User session failures

### Alert Thresholds

- Response time > 5 seconds
- Error rate > 5%
- Service unavailable > 2 minutes
- Circuit breaker open state
- API quota > 80% usage

### Log Analysis

```bash
# Search for specific errors
grep -r "CircuitBreakerOpen" logs/
grep -r "ServiceUnavailable" logs/

# Monitor real-time logs
tail -f logs/app.log | grep ERROR

# Analyze patterns
awk '/ERROR/ {print $1 " " $2}' logs/app.log | sort | uniq -c
```

## Recovery Verification

After resolving issues:

1. **Health Check Verification**
   ```bash
   curl http://localhost:3000/api/health
   # Ensure all services show "healthy"
   ```

2. **Functionality Testing**
   - Test critical user flows
   - Verify all integrations work
   - Check real-time features

3. **Performance Validation**
   - Monitor response times
   - Check error rates
   - Verify no degraded performance

4. **User Communication**
   - Update status page
   - Notify users of resolution
   - Document lessons learned