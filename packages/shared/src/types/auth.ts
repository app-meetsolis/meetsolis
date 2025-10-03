/**
 * Authentication and User Types
 * Shared types for user authentication and authorization
 */

/**
 * User role types for role-based access control
 */
export type UserRole = 'host' | 'co-host' | 'participant';

/**
 * User preferences for personalization
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  meeting_defaults?: {
    waiting_room?: boolean;
    mute_on_join?: boolean;
    video_on_join?: boolean;
  };
}

/**
 * Complete user profile (synced with Supabase database)
 */
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  role: UserRole;
  verified_badge: boolean;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

/**
 * Clerk webhook event types
 */
export type ClerkWebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended';

/**
 * Clerk webhook payload structure
 */
export interface ClerkWebhookPayload {
  type: ClerkWebhookEvent;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string;
    last_name: string;
    created_at: number;
    updated_at: number;
  };
}
