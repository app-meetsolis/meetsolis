/**
 * useUserProfile Hook
 * Fetches user profile data from Supabase (includes onboarding data)
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  title: string | null;
  bio: string | null;
  timezone: string | null;
  role: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user profile from Supabase
 * This includes onboarding data like display_name, title, bio
 */
export function useUserProfile() {
  const { isSignedIn } = useAuth();

  return useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: isSignedIn, // Only fetch when user is signed in
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Get display name from profile
 * Prefers display_name over name, falls back to "User"
 */
export function getDisplayName(profile?: UserProfile | null): string {
  if (!profile) return 'User';
  return profile.display_name || profile.name || 'User';
}
