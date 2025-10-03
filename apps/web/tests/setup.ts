/**
 * Test Setup File
 * Configure environment and global test settings
 */

// Set test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.CLERK_SECRET_KEY =
  process.env.CLERK_SECRET_KEY || 'test-clerk-secret';
process.env.CLERK_WEBHOOK_SECRET =
  process.env.CLERK_WEBHOOK_SECRET || 'test-webhook-secret';

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests (keep errors and warnings)
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};
