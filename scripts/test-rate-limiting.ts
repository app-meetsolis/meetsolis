/**
 * Rate Limiting Test Script
 * Tests that rate limiting is working correctly
 *
 * Usage: npx tsx scripts/test-rate-limiting.ts
 */

import { checkRateLimit, resetRateLimit, RateLimitPresets } from '../apps/web/src/lib/rate-limit';

interface TestResult {
  requestNumber: number;
  success: boolean;
  remaining: number;
  limit: number;
  expected: 'ALLOW' | 'BLOCK';
  actual: 'ALLOWED' | 'BLOCKED';
  passed: boolean;
}

async function testRateLimiting() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 RATE LIMITING TEST');
  console.log('='.repeat(60) + '\n');

  const testIdentifier = 'test-script:user-123:meeting-456';
  const results: TestResult[] = [];

  console.log('📝 Test Configuration:');
  console.log(`   Limit: ${RateLimitPresets.MESSAGE.limit} messages`);
  console.log(`   Window: ${RateLimitPresets.MESSAGE.window} seconds`);
  console.log(`   Identifier: ${testIdentifier}\n`);

  // Reset rate limit first
  console.log('🔄 Resetting rate limit...\n');
  await resetRateLimit(testIdentifier);

  console.log('📨 Sending test requests...\n');

  // Test 12 requests (limit is 10, so last 2 should fail)
  for (let i = 1; i <= 12; i++) {
    const result = await checkRateLimit(testIdentifier, RateLimitPresets.MESSAGE);

    const expected: 'ALLOW' | 'BLOCK' = i <= RateLimitPresets.MESSAGE.limit ? 'ALLOW' : 'BLOCK';
    const actual: 'ALLOWED' | 'BLOCKED' = result.success ? 'ALLOWED' : 'BLOCKED';
    const passed = (expected === 'ALLOW' && actual === 'ALLOWED') || (expected === 'BLOCK' && actual === 'BLOCKED');

    results.push({
      requestNumber: i,
      success: result.success,
      remaining: result.remaining,
      limit: result.limit,
      expected,
      actual,
      passed,
    });

    const icon = passed ? '✅' : '❌';
    const status = result.success ? 'ALLOWED' : 'BLOCKED';
    const expectedText = expected === 'ALLOW' ? '(should allow)' : '(should block)';

    console.log(
      `${icon} Request ${i.toString().padStart(2, ' ')}: ${status.padEnd(7, ' ')} ${expectedText} - Remaining: ${result.remaining}/${result.limit}`
    );

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Cleanup
  console.log('\n🔄 Cleaning up test data...\n');
  await resetRateLimit(testIdentifier);

  // Print summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Requests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}\n`);

  if (failedTests > 0) {
    console.log('❌ FAILED REQUESTS:\n');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   Request ${r.requestNumber}:`);
        console.log(`      Expected: ${r.expected}`);
        console.log(`      Actual: ${r.actual}`);
        console.log(`      Remaining: ${r.remaining}/${r.limit}\n`);
      });
  }

  console.log('='.repeat(60));

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Rate limiting is working correctly.');
    console.log('\nDetails:');
    console.log(`   • Requests 1-${RateLimitPresets.MESSAGE.limit}: All allowed ✅`);
    console.log(`   • Requests ${RateLimitPresets.MESSAGE.limit + 1}-${totalTests}: All blocked ✅`);
    console.log(`   • Rate limit headers would be sent in API responses ✅`);
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\nRate limiting is NOT working as expected.');
    console.log('Please check:');
    console.log('   1. Upstash Redis is configured correctly');
    console.log('   2. Environment variables are set');
    console.log('   3. Run verify-redis-setup.ts to diagnose');
    process.exit(1);
  }

  console.log('='.repeat(60) + '\n');
}

async function main() {
  try {
    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('\n⚠️  WARNING: Upstash Redis environment variables not set.');
      console.log('Rate limiting will be disabled in development mode.\n');
      console.log('To test rate limiting:');
      console.log('1. Set up Upstash Redis (see UPSTASH_SETUP.md)');
      console.log('2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local');
      console.log('3. Restart and run this script again\n');
      process.exit(1);
    }

    await testRateLimiting();
  } catch (error) {
    console.error('\n❌ Test script failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();
