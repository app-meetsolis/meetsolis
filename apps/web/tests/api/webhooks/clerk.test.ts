/**
 * Clerk Webhook Handler Tests
 * Tests for Clerk webhook integration
 */

import { POST } from '@/app/api/webhooks/clerk/route';
import { NextRequest } from 'next/server';
import * as authService from '@/services/auth';

// Mock the auth service
jest.mock('@/services/auth');

// Mock svix
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
      },
    }),
  })),
}));

// Mock headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: (name: string) => {
      const headers: Record<string, string> = {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature',
      };
      return headers[name];
    },
  })),
}));

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_secret';
  });

  afterEach(() => {
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  it('should handle user.created event', async () => {
    const mockCreateUser = jest
      .spyOn(authService, 'createUserProfile')
      .mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        name: 'John Doe',
        role: 'participant',
        verified_badge: false,
        preferences: {
          auto_mute_on_join: false,
          default_video_off: false,
          preferred_view: 'gallery',
          theme: 'light',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    const mockRequest = {
      text: async () =>
        JSON.stringify({
          type: 'user.created',
          data: {
            id: 'user_123',
            email_addresses: [{ email_address: 'test@example.com' }],
            first_name: 'John',
            last_name: 'Doe',
          },
        }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCreateUser).toHaveBeenCalledWith(
      'user_123',
      'test@example.com',
      'John',
      'Doe'
    );
  });

  it('should handle user.updated event', async () => {
    const mockUpdateUser = jest
      .spyOn(authService, 'updateUserProfile')
      .mockResolvedValue({
        id: 'user_123',
        email: 'updated@example.com',
        name: 'Jane Doe',
        role: 'participant',
        verified_badge: false,
        preferences: {
          auto_mute_on_join: false,
          default_video_off: false,
          preferred_view: 'gallery',
          theme: 'light',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    const mockRequest = {
      text: async () =>
        JSON.stringify({
          type: 'user.updated',
          data: {
            id: 'user_123',
            email_addresses: [{ email_address: 'updated@example.com' }],
            first_name: 'Jane',
            last_name: 'Doe',
          },
        }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith(
      'user_123',
      'updated@example.com',
      'Jane',
      'Doe'
    );
  });

  it('should handle user.deleted event', async () => {
    const mockDeleteUser = jest
      .spyOn(authService, 'deleteUserProfile')
      .mockResolvedValue();

    const mockRequest = {
      text: async () =>
        JSON.stringify({
          type: 'user.deleted',
          data: {
            id: 'user_123',
          },
        }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith('user_123');
  });

  it('should return 401 when webhook secret is missing', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;

    const mockRequest = {
      text: async () => JSON.stringify({}),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Webhook verification failed');
  });
});
