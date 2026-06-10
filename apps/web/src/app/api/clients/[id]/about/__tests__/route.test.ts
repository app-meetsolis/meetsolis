/**
 * Story 7.7 — tests for PATCH /api/clients/[id]/about
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

function setupSupabase(returnedRow: Record<string, unknown> | null = {}) {
  let payload: any = null;
  const supabase: any = {
    from: jest.fn(() => ({
      update: jest.fn((data: any) => {
        payload = data;
        return {
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: returnedRow,
            error: null,
          }),
        };
      }),
    })),
  };
  supabase.__getPayload = () => payload;
  return supabase;
}

describe('PATCH /api/clients/[id]/about', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
  });

  it('400 — empty body', async () => {
    const supabase = setupSupabase();
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      { method: 'PATCH', body: JSON.stringify({}) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('400 — invalid company_size enum', async () => {
    const supabase = setupSupabase();
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      { method: 'PATCH', body: JSON.stringify({ company_size: 'huge' }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('200 — accepts partial industry update', async () => {
    const supabase = setupSupabase({ industry: 'Healthcare' });
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      {
        method: 'PATCH',
        body: JSON.stringify({ industry: 'Healthcare' }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(supabase.__getPayload()).toEqual({ industry: 'Healthcare' });
  });

  it('200 — strips HTML from free-text fields (XSS guard)', async () => {
    const supabase = setupSupabase({
      about_notes: 'safe text',
    });
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          about_notes: '<script>alert(1)</script>safe text',
        }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    const payload = supabase.__getPayload();
    expect(payload.about_notes).not.toMatch(/<script>/);
    expect(payload.about_notes).toContain('safe text');
  });

  it('200 — accepts null to clear a field', async () => {
    const supabase = setupSupabase({ industry: null });
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      {
        method: 'PATCH',
        body: JSON.stringify({ industry: null }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(supabase.__getPayload()).toEqual({ industry: null });
  });

  it('404 — client not found', async () => {
    const supabase = setupSupabase(null);
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      {
        method: 'PATCH',
        body: JSON.stringify({ industry: 'Tech' }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(404);
  });

  it('401 — unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null } as any);
    const supabase = setupSupabase();
    mockCreateClient.mockReturnValue(supabase);
    const req = new NextRequest(
      `http://localhost:3000/api/clients/${VALID_ID}/about`,
      { method: 'PATCH', body: JSON.stringify({ industry: 'x' }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(401);
  });
});
