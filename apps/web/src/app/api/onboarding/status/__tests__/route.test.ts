/**
 * Tests for Onboarding Status API
 * Story 1.9: Onboarding Completion Enforcement & Optimization
 *
 * Note: These tests verify the security and validation logic.
 * Full integration tests are in tests/integration/onboarding-enforcement/
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock sanitize-html
jest.mock('sanitize-html', () => ({
  default: jest.fn((input: string) => input),
}));

const { auth } = require('@clerk/nextjs');

describe('Onboarding Status API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user not authenticated', async () => {
    auth.mockReturnValue({ userId: null });

    const req = new NextRequest('http://localhost/api/onboarding/status');
    const response = await GET(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return onboarding status for authenticated user', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: {
                  onboarding_completed: false,
                  onboarding_completed_at: null,
                  onboarding_last_step: 'profile',
                },
                error: null,
              })
            ),
          })),
        })),
      })),
    });

    const req = new NextRequest('http://localhost/api/onboarding/status');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.onboarding_completed).toBe(false);
    expect(data.onboarding_last_step).toBe('profile');
  });

  it('should handle database errors gracefully', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'Database error' },
              })
            ),
          })),
        })),
      })),
    });

    const req = new NextRequest('http://localhost/api/onboarding/status');
    const response = await GET(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

describe('Onboarding Status API - PUT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user not authenticated', async () => {
    auth.mockReturnValue({ userId: null });

    const req = new NextRequest('http://localhost/api/onboarding/status', {
      method: 'PUT',
      body: JSON.stringify({
        step: 'welcome',
        completed: false,
      }),
    });

    const response = await PUT(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should validate input with Zod schema', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const req = new NextRequest('http://localhost/api/onboarding/status', {
      method: 'PUT',
      body: JSON.stringify({
        step: 'invalid_step',
        completed: false,
      }),
    });

    const response = await PUT(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('INVALID_INPUT');
  });

  it('should update onboarding status successfully', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    onboarding_last_step: 'complete',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      })),
    });

    const req = new NextRequest('http://localhost/api/onboarding/status', {
      method: 'PUT',
      body: JSON.stringify({
        step: 'complete',
        completed: true,
      }),
    });

    const response = await PUT(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.onboarding_completed).toBe(true);
    expect(data.message).toBe('Onboarding status updated successfully');
  });

  it('should sanitize string inputs', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const sanitizeHtml = require('sanitize-html').default;

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    onboarding_completed: false,
                    onboarding_completed_at: null,
                    onboarding_last_step: 'profile',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      })),
    });

    const req = new NextRequest('http://localhost/api/onboarding/status', {
      method: 'PUT',
      body: JSON.stringify({
        step: 'profile',
        completed: false,
        onboarding_last_step: '<script>alert("xss")</script>profile',
      }),
    });

    const response = await PUT(req);

    expect(sanitizeHtml).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});

describe('Onboarding Status API - Rate Limiting', () => {
  it('should enforce rate limiting (100 requests/minute)', async () => {
    auth.mockReturnValue({ userId: 'user_123' });

    const { createClient } = require('@supabase/supabase-js');
    createClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { onboarding_completed: false },
                error: null,
              })
            ),
          })),
        })),
      })),
    });

    // Make 101 requests rapidly
    const requests = [];
    for (let i = 0; i < 101; i++) {
      const req = new NextRequest('http://localhost/api/onboarding/status');
      requests.push(GET(req));
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
