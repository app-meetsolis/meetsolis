'use client';

import { useEffect } from 'react';

/**
 * Initializes the debug logger on the client side
 * This makes window.getWebRTCLogs() available in the browser console
 */
export function DebugLoggerInit() {
  useEffect(() => {
    // Dynamically import the debug logger to ensure it runs on client side
    import('@/lib/debug-logger').then(() => {
      console.log(
        '%c✅ WebRTC Debug Logger Initialized',
        'color: green; font-weight: bold'
      );
    });
  }, []);

  return null; // This component renders nothing
}
