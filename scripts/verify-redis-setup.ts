/**
 * Upstash Redis Setup Verification Script
 * Run this to verify your Redis configuration is working
 *
 * Usage: npx tsx scripts/verify-redis-setup.ts
 */

import { Redis } from '@upstash/redis';

interface VerificationResult {
  step: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

async function verifyEnvironmentVariables(): Promise<boolean> {
  console.log('\n📋 Step 1: Checking Environment Variables...\n');

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url) {
    results.push({
      step: 'Environment Variables',
      status: 'FAIL',
      message: 'UPSTASH_REDIS_REST_URL is not set',
      details: 'Add UPSTASH_REDIS_REST_URL to your .env.local file',
    });
    return false;
  }

  if (!token) {
    results.push({
      step: 'Environment Variables',
      status: 'FAIL',
      message: 'UPSTASH_REDIS_REST_TOKEN is not set',
      details: 'Add UPSTASH_REDIS_REST_TOKEN to your .env.local file',
    });
    return false;
  }

  results.push({
    step: 'Environment Variables',
    status: 'PASS',
    message: 'Both environment variables are set',
    details: `URL: ${url.substring(0, 30)}...`,
  });

  return true;
}

async function verifyRedisConnection(): Promise<boolean> {
  console.log('🔌 Step 2: Testing Redis Connection...\n');

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Test ping
    const pingResult = await redis.ping();

    if (pingResult !== 'PONG') {
      results.push({
        step: 'Redis Connection',
        status: 'FAIL',
        message: 'Redis ping did not return PONG',
        details: `Got: ${pingResult}`,
      });
      return false;
    }

    results.push({
      step: 'Redis Connection',
      status: 'PASS',
      message: 'Successfully connected to Redis',
      details: 'PING → PONG',
    });

    return true;
  } catch (error) {
    results.push({
      step: 'Redis Connection',
      status: 'FAIL',
      message: 'Failed to connect to Redis',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function verifyRateLimitingFunctions(): Promise<boolean> {
  console.log('⚡ Step 3: Testing Rate Limiting Functions...\n');

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const testKey = 'ratelimit:test:verify-script';

    // Test INCR
    const count = await redis.incr(testKey);

    // Test EXPIRE
    await redis.expire(testKey, 10);

    // Test TTL
    const ttl = await redis.ttl(testKey);

    // Test DEL (cleanup)
    await redis.del(testKey);

    if (typeof count !== 'number' || count < 1) {
      results.push({
        step: 'Rate Limiting Functions',
        status: 'FAIL',
        message: 'INCR command failed',
        details: `Expected number, got: ${count}`,
      });
      return false;
    }

    if (typeof ttl !== 'number' || ttl < 0) {
      results.push({
        step: 'Rate Limiting Functions',
        status: 'FAIL',
        message: 'TTL command failed',
        details: `Expected positive number, got: ${ttl}`,
      });
      return false;
    }

    results.push({
      step: 'Rate Limiting Functions',
      status: 'PASS',
      message: 'All Redis commands working correctly',
      details: 'INCR, EXPIRE, TTL, DEL all functional',
    });

    return true;
  } catch (error) {
    results.push({
      step: 'Rate Limiting Functions',
      status: 'FAIL',
      message: 'Redis commands failed',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function verifyRateLimitUtility(): Promise<boolean> {
  console.log('🛠️  Step 4: Testing Rate Limit Utility...\n');

  try {
    // Import the rate limit utility
    const { checkRateLimit, resetRateLimit, RateLimitPresets } = await import(
      '../apps/web/src/lib/rate-limit'
    );

    // Test rate limiting
    const testIdentifier = 'verify-script:test-user';

    // Reset first
    await resetRateLimit(testIdentifier);

    // Test 5 requests (should all succeed)
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(testIdentifier, {
        limit: 5,
        window: 60,
      });

      if (!result.success && i < 5) {
        results.push({
          step: 'Rate Limit Utility',
          status: 'FAIL',
          message: `Request ${i + 1} was blocked unexpectedly`,
          details: `Remaining: ${result.remaining}`,
        });
        return false;
      }
    }

    // 6th request should fail
    const blockedResult = await checkRateLimit(testIdentifier, {
      limit: 5,
      window: 60,
    });

    if (blockedResult.success) {
      results.push({
        step: 'Rate Limit Utility',
        status: 'FAIL',
        message: 'Rate limit did not block after limit exceeded',
        details: `Expected success=false, got success=true`,
      });
      return false;
    }

    // Cleanup
    await resetRateLimit(testIdentifier);

    results.push({
      step: 'Rate Limit Utility',
      status: 'PASS',
      message: 'Rate limiting utility working correctly',
      details: '5 requests allowed, 6th blocked as expected',
    });

    return true;
  } catch (error) {
    results.push({
      step: 'Rate Limit Utility',
      status: 'FAIL',
      message: 'Rate limit utility test failed',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60) + '\n');

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.step}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
  });

  const allPassed = results.every((r) => r.status === 'PASS');

  console.log('='.repeat(60));
  if (allPassed) {
    console.log('🎉 ALL CHECKS PASSED!');
    console.log('✅ Your Upstash Redis setup is working correctly.');
    console.log('✅ Rate limiting is production-ready.');
    console.log('\nNext steps:');
    console.log('1. Deploy to staging environment');
    console.log('2. Run this script in staging');
    console.log('3. Test rate limiting with real API requests');
    console.log('4. Monitor Upstash dashboard for 24 hours');
  } else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('\nPlease fix the issues above before deploying.');
    console.log('See UPSTASH_SETUP.md for troubleshooting help.');
    process.exit(1);
  }
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 UPSTASH REDIS SETUP VERIFICATION');
  console.log('='.repeat(60));
  console.log('\nThis script will verify your Upstash Redis configuration.');
  console.log('Make sure you have set up your .env.local file first.\n');

  const envOk = await verifyEnvironmentVariables();
  if (!envOk) {
    printResults();
    return;
  }

  const connectionOk = await verifyRedisConnection();
  if (!connectionOk) {
    printResults();
    return;
  }

  const functionsOk = await verifyRateLimitingFunctions();
  if (!functionsOk) {
    printResults();
    return;
  }

  const utilityOk = await verifyRateLimitUtility();
  if (!utilityOk) {
    printResults();
    return;
  }

  printResults();
}

// Run verification
main().catch((error) => {
  console.error('\n❌ Verification script failed with error:');
  console.error(error);
  process.exit(1);
});
