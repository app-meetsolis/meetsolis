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
  auto_mute_on_join: boolean;
  default_video_off: boolean;
  preferred_view: 'gallery' | 'speaker';
  theme: 'light' | 'dark';
}

/**
 * Complete user profile
 */
export interface User {
  id: string;
  email: string;
  name: string;
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
