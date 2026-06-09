/**
 * Story 7.2 — tests for POST/PATCH /api/clients/[id]/intelligence-strip
 */

import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      serviceRoleKey: 'test-service-role-key',
    },
  },
}));

jest.mock('@/lib/helpers/user', () => ({
  getInternalUserId: jest.fn().mockResolvedValue('user-uuid'),
}));

jest.mock('@/lib/billing/checkUsage', () => ({
  getUserTier: jest.fn(),
}));

jest.mock('@/lib/clients/generate-intelligence-strip', () => ({
  generateIntelligenceStrip: jest.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getUserTier } from '@/lib/billing/checkUsage';
import { generateIntelligenceStrip } from '@/lib/clients/generate-intelligence-strip';
import { POST, PATCH } from '../route';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockGetTier = getUserTier as jest.MockedFunction<typeof getUserTier>;
const mockGenerate = generateIntelligenceStrip as jest.MockedFunction<
  typeof generateIntelligenceStrip
>;

const VALID_ID = '123e4567-e89b-12d3-a456-426614174000';

describe('POST /api/clients/[id]/intelligence-strip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
    mockCreateClient.mockReturnValue({} as any);
  });

  it('returns 400 for invalid UUID', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/clients/bad/intelligence-strip',
      { method: 'POST' }
    );
    const res = await POST(req, { params: { id: 'bad' } });
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      { method: 'POST' }
    );
    const res = await POST(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(401);
  });

  it('returns 403 with UPGRADE_REQUIRED for Free coach', async () => {
    mockGetTier.mockResolvedValue('free' as any);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      { method: 'POST' }
    );
    const res = await POST(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('UPGRADE_REQUIRED');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns 200 with strip on success for Pro coach', async () => {
    mockGetTier.mockResolvedValue('pro' as any);
    mockGenerate.mockResolvedValue({
      success: true,
      strip: {
        recurring_theme: 't',
        theme_frequency: 'f',
        recent_breakthrough: 'b',
        current_focus: 'c',
        generated_at: new Date().toISOString(),
      },
    });
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      { method: 'POST' }
    );
    const res = await POST(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.strip).toBeDefined();
  });

  it('returns 422 NO_SESSIONS when client has no sessions', async () => {
    mockGetTier.mockResolvedValue('pro' as any);
    mockGenerate.mockResolvedValue({
      success: false,
      skipped: 'no_sessions',
    });
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      { method: 'POST' }
    );
    const res = await POST(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/clients/[id]/intelligence-strip', () => {
  let supabase: any;
  let updatePayload: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
    updatePayload = null;

    supabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            ai_intelligence_strip: {
              recurring_theme: 'old',
              theme_frequency: 'old',
              recent_breakthrough: 'old',
              current_focus: 'old',
              generated_at: '2026-01-01T00:00:00Z',
            },
          },
          error: null,
        }),
        update: jest.fn((payload: any) => {
          updatePayload = payload;
          return {
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ai_intelligence_strip: payload.ai_intelligence_strip },
              error: null,
            }),
          };
        }),
      })),
    };
    mockCreateClient.mockReturnValue(supabase);
  });

  it('returns 400 for empty body', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('merges patch into existing strip and preserves generated_at', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/intelligence-strip`,
      {
        method: 'PATCH',
        body: JSON.stringify({ recurring_theme: 'new theme' }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(updatePayload.ai_intelligence_strip.recurring_theme).toBe(
      'new theme'
    );
    expect(updatePayload.ai_intelligence_strip.theme_frequency).toBe('old');
    expect(updatePayload.ai_intelligence_strip.generated_at).toBe(
      '2026-01-01T00:00:00Z'
    );
    // Critical: never touches coach_notes on this route
    expect(updatePayload).not.toHaveProperty('coach_notes');
  });
});
