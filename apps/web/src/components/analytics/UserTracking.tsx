/**
 * User Tracking Component
 * Handles Clerk user identification for analytics
 * Only use in layouts that have ClerkProvider
 */

'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { analytics } from '@/lib/analytics';
import { setUserContext, clearUserContext } from '@/lib/analytics/sentry';

export function UserTracking() {
  const { user, isLoaded } = useUser();

  // Identify user when they sign in
  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // Identify user across all analytics platforms
      analytics.identify(user.id, {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || undefined,
        signupDate: user.createdAt?.toISOString(),
      });

      // Set user context in Sentry
      setUserContext(user.id, user.primaryEmailAddress?.emailAddress, {
        name: user.fullName || undefined,
        createdAt: user.createdAt?.toISOString(),
      });

      console.log('[Analytics] User identified:', user.id);
    } else {
      // Clear user context on logout
      clearUserContext();
      analytics.reset();

      console.log('[Analytics] User context cleared');
    }
  }, [user, isLoaded]);

  return null;
}
