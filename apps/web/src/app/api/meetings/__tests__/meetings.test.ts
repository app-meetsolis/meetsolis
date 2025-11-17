/**
 * Meetings API Tests
 * Tests for meeting creation, fetching, and participant management
 */

import { createMocks } from 'node-mocks-http';
import { POST, GET } from '../route';
import { GET as GET_SINGLE } from '../[id]/route';
import { POST as POST_JOIN } from '../[id]/join/route';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-nanoid-123'),
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-clerk-id' })),
  currentUser: jest.fn(() => ({
    id: 'test-clerk-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
  })),
}));

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  or: jest.fn(() => mockSupabaseClient),
  ilike: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  single: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock user helper
jest.mock('@/lib/helpers/user', () => ({
  getUserByClerkId: jest.fn(() => ({ id: 'test-user-uuid' })),
}));

// Mock createUserProfile
jest.mock('@/services/auth', () => ({
  createUserProfile: jest.fn(() => ({ id: 'test-user-uuid' })),
}));

describe('Meetings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/meetings (Create Meeting)', () => {
    it('should create a new meeting with valid data', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        host_id: 'test-user-uuid',
        title: 'Test Meeting',
        description: 'Test Description',
        status: 'active',
        invite_link: 'https://meetsolis.com/meeting/abc123',
        settings: {
          allow_screen_share: true,
          allow_whiteboard: true,
        },
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'Test Meeting',
          description: 'Test Description',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Test Meeting');
      expect(data.invite_link).toContain('meeting');
    });

    it('should return 400 for invalid input', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          title: '', // Invalid - empty title
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('should return 401 for unauthenticated request', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockReturnValueOnce({ userId: null });

      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'Test Meeting',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/meetings (List Meetings)', () => {
    it("should return user's meetings", async () => {
      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Meeting 1',
          status: 'active',
        },
        {
          id: 'meeting-2',
          title: 'Meeting 2',
          status: 'scheduled',
        },
      ];

      mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.or.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockResolvedValue({
        data: mockMeetings,
        error: null,
      });

      const { req } = createMocks({
        method: 'GET',
        url: '/api/meetings',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
    });

    it('should filter meetings by status', async () => {
      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Active Meeting',
          status: 'active',
        },
      ];

      mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockResolvedValue({
        data: mockMeetings,
        error: null,
      });

      const { req } = createMocks({
        method: 'GET',
        url: '/api/meetings?status=active',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('GET /api/meetings/[id] (Get Meeting)', () => {
    it('should return meeting with participants', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        title: 'Test Meeting',
        status: 'active',
      };

      const mockParticipants = [
        {
          id: 'participant-1',
          user_id: 'user-1',
          role: 'host',
        },
        {
          id: 'participant-2',
          user_id: 'user-2',
          role: 'participant',
        },
      ];

      // First call for meeting
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockMeeting,
        error: null,
      });

      // Second call for participants
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.order.mockResolvedValue({
        data: mockParticipants,
        error: null,
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET_SINGLE(req as any, {
        params: { id: 'meeting-uuid' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meeting).toBeDefined();
      expect(data.participants).toBeDefined();
      expect(Array.isArray(data.participants)).toBe(true);
      expect(data.participants.length).toBe(2);
    });

    it('should return 404 for non-existent meeting', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET_SINGLE(req as any, {
        params: { id: 'nonexistent' },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/meetings/[id]/join (Join Meeting)', () => {
    it('should allow user to join a meeting', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        status: 'active',
        locked: false,
        max_participants: 100,
      };

      const mockParticipant = {
        id: 'participant-uuid',
        meeting_id: 'meeting-uuid',
        user_id: 'test-user-uuid',
        role: 'participant',
      };

      // Meeting lookup
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: mockMeeting, error: null })
        .mockResolvedValueOnce({ data: null, error: null }) // Existing participant check
        .mockResolvedValueOnce({ data: mockParticipant, error: null }); // Insert result

      // Participant count
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockResolvedValue({ count: 5, error: null });

      const { req } = createMocks({
        method: 'POST',
        body: {
          user_id: 'test-user-uuid',
          role: 'participant',
        },
      });

      const response = await POST_JOIN(req as any, {
        params: { id: 'meeting-uuid' },
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.meeting_id).toBe('meeting-uuid');
    });

    it('should return 403 for locked meeting', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        status: 'active',
        locked: true,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      const { req } = createMocks({
        method: 'POST',
        body: {
          user_id: 'test-user-uuid',
        },
      });

      const response = await POST_JOIN(req as any, {
        params: { id: 'meeting-uuid' },
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('locked');
    });

    it('should return 403 when meeting is full', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        status: 'active',
        locked: false,
        max_participants: 10,
      };

      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: mockMeeting, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      // Participant count equals max
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockResolvedValue({ count: 10, error: null });

      const { req } = createMocks({
        method: 'POST',
        body: {
          user_id: 'test-user-uuid',
        },
      });

      const response = await POST_JOIN(req as any, {
        params: { id: 'meeting-uuid' },
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('full');
    });

    it('should return 403 for ended meeting', async () => {
      const mockMeeting = {
        id: 'meeting-uuid',
        status: 'ended',
        locked: false,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      const { req } = createMocks({
        method: 'POST',
        body: {
          user_id: 'test-user-uuid',
        },
      });

      const response = await POST_JOIN(req as any, {
        params: { id: 'meeting-uuid' },
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain('ended');
    });
  });
});
