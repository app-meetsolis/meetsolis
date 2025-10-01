/**
 * useAuth Hook
 * Wrapper around Clerk's authentication hooks with enhanced type safety
 */

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { AuthState, User, UserRole } from '@meetsolis/shared/types';
import { getDefaultRole } from '@/lib/auth/roles';

/**
 * Enhanced authentication hook with type-safe user data
 * @returns Authentication state with user profile
 */
export function useAuth(): AuthState {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();

  // Convert Clerk user to our User type
  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name:
          `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
          'User',
        role: (clerkUser.publicMetadata?.role as UserRole) ?? getDefaultRole(),
        verified_badge:
          clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        preferences: {
          auto_mute_on_join: false,
          default_video_off: false,
          preferred_view: 'gallery',
          theme: 'light',
        },
        created_at: clerkUser.createdAt?.toString() ?? new Date().toISOString(),
        updated_at: clerkUser.updatedAt?.toString() ?? new Date().toISOString(),
      }
    : null;

  return {
    user,
    isLoading: !isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}
