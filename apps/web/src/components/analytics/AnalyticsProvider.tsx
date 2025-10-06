/**
 * Analytics Provider Component
 * Initializes analytics services and tracks page views
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { analytics } from '@/lib/analytics';
import { reportWebVitals } from '@/lib/analytics/web-vitals';
import {
  initializeSentry,
  setUserContext,
  clearUserContext,
} from '@/lib/analytics/sentry';
import { configureErrorAlerting } from '@/lib/analytics/error-alerting';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Initialize analytics on mount
  useEffect(() => {
    // Initialize Sentry
    initializeSentry();

    // Configure error alerting
    configureErrorAlerting();

    // Initialize Web Vitals tracking
    reportWebVitals();

    // Initialize analytics manager (will wait for consent)
    analytics.initialize();

    console.log('[Analytics] Initialized all services');
  }, []);

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

  // Track page views
  useEffect(() => {
    if (!pathname) return;

    // Build page URL with search params
    const url = searchParams ? `${pathname}?${searchParams}` : pathname;

    // Track page view across all platforms
    analytics.page(pathname, {
      path: pathname,
      url,
      referrer: document.referrer || undefined,
      title: document.title,
    });

    console.log('[Analytics] Page view:', pathname);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
