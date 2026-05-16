import { POST } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));
jest.mock('@/lib/sessions/generate-action-items', () => ({
  runGenerateActionItems: jest.fn(),
}));

const mockSingle = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockSingle,
    })),
  })),
}));
jest.mock('@/lib/config/env', () => ({
  config: { supabase: { url: 'x', serviceRoleKey: 'y' } },
}));

import { auth } from '@clerk/nextjs/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { runGenerateActionItems } from '@/lib/sessions/generate-action-items';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetInternalUserId = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;
const mockRun = runGenerateActionItems as jest.MockedFunction<
  typeof runGenerateActionItems
>;

const VALID_ID = '11111111-1111-1111-1111-111111111111';

type AuthReturn = Awaited<ReturnType<typeof auth>>;
function setAuth(userId: string | null) {
  mockAuth.mockResolvedValue({ userId } as AuthReturn);
}

function call(id: string) {
  return POST(
    new NextRequest('http://localhost/api/sessions/x/action-items/generate', {
      method: 'POST',
    }),
    { params: { id } }
  );
}

describe('POST /api/sessions/[id]/action-items/generate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 for an invalid session ID', async () => {
    setAuth('clerk_1');
    const res = await call('not-a-uuid');
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    setAuth(null);
    const res = await call(VALID_ID);
    expect(res.status).toBe(401);
  });

  it('returns 404 when the session is not owned by the user', async () => {
    setAuth('clerk_1');
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockSingle.mockResolvedValue({
      data: { user_id: 'other_user', transcript_text: 't' },
    });
    const res = await call(VALID_ID);
    expect(res.status).toBe(404);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('returns 409 when the session has no transcript', async () => {
    setAuth('clerk_1');
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockSingle.mockResolvedValue({
      data: { user_id: 'user_1', transcript_text: null },
    });
    const res = await call(VALID_ID);
    expect(res.status).toBe(409);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('returns the generated action items on success', async () => {
    setAuth('clerk_1');
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockSingle.mockResolvedValue({
      data: { user_id: 'user_1', transcript_text: 'transcript' },
    });
    mockRun.mockResolvedValue({
      status: 'complete',
      action_items: [
        {
          id: 'a1',
          session_id: VALID_ID,
          client_id: 'c1',
          user_id: 'user_1',
          description: 'Do X',
          status: 'pending',
          assignee: 'client',
          completed: false,
          completed_at: null,
          due_date: null,
          created_at: '',
          updated_at: '',
        },
      ],
    });
    const res = await call(VALID_ID);
    const body = (await res.json()) as { action_items: unknown[] };
    expect(res.status).toBe(200);
    expect(body.action_items).toHaveLength(1);
    expect(mockRun).toHaveBeenCalledWith(VALID_ID, 'user_1');
  });
});
