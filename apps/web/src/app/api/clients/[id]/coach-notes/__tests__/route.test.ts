/**
 * Story 7.2 — tests for PATCH /api/clients/[id]/coach-notes
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

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { PATCH } from '../route';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

const VALID_ID = '123e4567-e89b-12d3-a456-426614174000';

describe('PATCH /api/clients/[id]/coach-notes', () => {
  let supabase: any;
  let updatePayload: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
    updatePayload = null;

    supabase = {
      from: jest.fn(() => ({
        update: jest.fn((payload: any) => {
          updatePayload = payload;
          return {
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { coach_notes: payload.coach_notes },
              error: null,
            }),
          };
        }),
      })),
    };
    mockCreateClient.mockReturnValue(supabase);
  });

  it('returns 400 when coach_notes missing', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/coach-notes`,
      { method: 'PATCH', body: JSON.stringify({}) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('returns 400 when coach_notes exceeds 5000 chars', async () => {
    const big = 'x'.repeat(5001);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/coach-notes`,
      { method: 'PATCH', body: JSON.stringify({ coach_notes: big }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('writes ONLY coach_notes — never touches ai_intelligence_strip', async () => {
    // Even if a malicious payload sends extra fields, Zod strips them.
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/coach-notes`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          coach_notes: 'private thoughts',
          ai_intelligence_strip: { recurring_theme: 'hacked' },
        }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(updatePayload).toEqual({ coach_notes: 'private thoughts' });
    expect(updatePayload).not.toHaveProperty('ai_intelligence_strip');
  });

  it('returns 404 when client not found', async () => {
    supabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    }));
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/coach-notes`,
      { method: 'PATCH', body: JSON.stringify({ coach_notes: 'a' }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(404);
  });
});
