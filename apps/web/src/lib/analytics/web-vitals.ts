/**
 * Web Vitals Reporter
 * Track Core Web Vitals metrics for performance monitoring
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { analytics } from './index';
import type { WebVitalsMetric } from '@meetsolis/shared';

/**
 * Report Web Vitals metrics to analytics
 */
export function reportWebVitals(): void {
  if (typeof window === 'undefined') {
    return; // Server-side
  }

  try {
    // Cumulative Layout Shift
    onCLS(metric => {
      reportMetric(metric);
    });

    // First Input Delay
    onFID(metric => {
      reportMetric(metric);
    });

    // Largest Contentful Paint
    onLCP(metric => {
      reportMetric(metric);
    });

    // First Contentful Paint
    onFCP(metric => {
      reportMetric(metric);
    });

    // Time to First Byte
    onTTFB(metric => {
      reportMetric(metric);
    });
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Report individual metric to analytics
 */
function reportMetric(metric: Metric): void {
  const webVitalsMetric: WebVitalsMetric = {
    name: metric.name as 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB',
    value: metric.value,
    rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
    delta: metric.delta,
    id: metric.id,
  };

  analytics.track('web_vitals', {
    metric: webVitalsMetric.name,
    value: webVitalsMetric.value,
    rating: webVitalsMetric.rating,
    delta: webVitalsMetric.delta,
    id: webVitalsMetric.id,
    // Add page context
    page: window.location.pathname,
    url: window.location.href,
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Get performance rating thresholds
 */
export function getPerformanceThresholds() {
  return {
    LCP: {
      good: 2500, // ms
      needsImprovement: 4000,
    },
    FID: {
      good: 100, // ms
      needsImprovement: 300,
    },
    CLS: {
      good: 0.1,
      needsImprovement: 0.25,
    },
    FCP: {
      good: 1800, // ms
      needsImprovement: 3000,
    },
    TTFB: {
      good: 800, // ms
      needsImprovement: 1800,
    },
  };
}

/**
 * Check if a metric value is within acceptable range
 */
export function isMetricGood(
  metricName: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB',
  value: number
): boolean {
  const thresholds = getPerformanceThresholds();
  return value <= thresholds[metricName].good;
}

/**
 * Get performance budget status
 */
export function getPerformanceBudgetStatus(metrics: Record<string, number>): {
  passed: boolean;
  failing: string[];
} {
  const failing: string[] = [];
  const thresholds = getPerformanceThresholds();

  Object.entries(metrics).forEach(([name, value]) => {
    const metricName = name as 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';
    if (thresholds[metricName] && !isMetricGood(metricName, value)) {
      failing.push(name);
    }
  });

  return {
    passed: failing.length === 0,
    failing,
  };
}
