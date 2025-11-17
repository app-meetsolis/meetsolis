/**
 * Performance Utilities
 * Performance monitoring and optimization helpers
 */

import { logConnectionQuality, trackMeetingStart } from '../monitoring/sentry';

/**
 * Measure meeting connection time
 */
export class MeetingPerformanceMonitor {
  private startTime: number | null = null;
  private meetingId: string;

  constructor(meetingId: string) {
    this.meetingId = meetingId;
  }

  /**
   * Start timing
   */
  start() {
    this.startTime = performance.now();
  }

  /**
   * End timing and report
   */
  end() {
    if (!this.startTime) return;

    const duration = performance.now() - this.startTime;
    trackMeetingStart(this.meetingId, duration);

    console.log(`Meeting connection took ${duration.toFixed(2)}ms`);

    this.startTime = null;
    return duration;
  }
}

/**
 * Track bandwidth usage
 */
export class BandwidthMonitor {
  private lastBytesReceived = 0;
  private lastBytesSent = 0;
  private lastTimestamp = 0;

  /**
   * Calculate bandwidth from stats
   */
  calculateBandwidth(
    bytesReceived: number,
    bytesSent: number
  ): {
    downloadKbps: number;
    uploadKbps: number;
  } {
    const now = performance.now();

    if (this.lastTimestamp === 0) {
      this.lastBytesReceived = bytesReceived;
      this.lastBytesSent = bytesSent;
      this.lastTimestamp = now;

      return {
        downloadKbps: 0,
        uploadKbps: 0,
      };
    }

    const timeDiff = (now - this.lastTimestamp) / 1000; // Convert to seconds
    const receivedDiff = bytesReceived - this.lastBytesReceived;
    const sentDiff = bytesSent - this.lastBytesSent;

    const downloadKbps = (receivedDiff * 8) / (timeDiff * 1000); // Convert to Kbps
    const uploadKbps = (sentDiff * 8) / (timeDiff * 1000);

    this.lastBytesReceived = bytesReceived;
    this.lastBytesSent = bytesSent;
    this.lastTimestamp = now;

    return {
      downloadKbps: Math.round(downloadKbps),
      uploadKbps: Math.round(uploadKbps),
    };
  }

  /**
   * Reset monitor
   */
  reset() {
    this.lastBytesReceived = 0;
    this.lastBytesSent = 0;
    this.lastTimestamp = 0;
  }
}

/**
 * Lazy load component with retry
 */
export function lazyLoadWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    componentImport()
      .then(resolve)
      .catch(error => {
        if (retries === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          lazyLoadWithRetry(componentImport, retries - 1, interval)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
