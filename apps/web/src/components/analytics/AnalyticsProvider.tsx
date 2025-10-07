/**
 * Analytics Provider Component
 * Initializes analytics services and tracks page views
 */

'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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

function AnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return null;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>
      {children}
    </>
  );
}
