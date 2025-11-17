/**
 * useReconnection Hook
 * Implements automatic reconnection with exponential backoff
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionState } from '../../../../packages/shared/types/webrtc';

export interface ReconnectionConfig {
  maxAttempts?: number;
  delays?: number[]; // Exponential backoff delays in ms
  onReconnectAttempt?: (attempt: number) => void;
  onReconnectSuccess?: () => void;
  onReconnectFailed?: () => void;
}

export interface UseReconnectionResult {
  connectionState: ConnectionState;
  reconnectAttempt: number;
  isReconnecting: boolean;
  startReconnection: () => void;
  stopReconnection: () => void;
  resetAttempts: () => void;
}

const DEFAULT_DELAYS = [0, 1000, 2000, 4000, 8000]; // Exponential backoff

/**
 * Hook for managing automatic reconnection
 */
export function useReconnection(
  reconnectFn: () => Promise<void>,
  config: ReconnectionConfig = {}
): UseReconnectionResult {
  const {
    maxAttempts = 5,
    delays = DEFAULT_DELAYS,
    onReconnectAttempt,
    onReconnectSuccess,
    onReconnectFailed,
  } = config;

  const [connectionState, setConnectionState] =
    useState<ConnectionState>('closed');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  /**
   * Attempt reconnection
   */
  const attemptReconnection = useCallback(
    async (attempt: number) => {
      if (attempt >= maxAttempts) {
        console.error('Max reconnection attempts reached');
        setConnectionState('failed');
        setIsReconnecting(false);

        if (onReconnectFailed) {
          onReconnectFailed();
        }

        return;
      }

      try {
        setReconnectAttempt(attempt + 1);
        setConnectionState('reconnecting');

        if (onReconnectAttempt) {
          onReconnectAttempt(attempt + 1);
        }

        console.log(`Reconnection attempt ${attempt + 1} of ${maxAttempts}`);

        await reconnectFn();

        // Success
        setConnectionState('connected');
        setIsReconnecting(false);
        setReconnectAttempt(0);

        if (onReconnectSuccess) {
          onReconnectSuccess();
        }
      } catch (error) {
        console.error(`Reconnection attempt ${attempt + 1} failed:`, error);

        if (isActiveRef.current) {
          // Schedule next attempt with exponential backoff
          const delay = delays[Math.min(attempt, delays.length - 1)];

          timeoutRef.current = setTimeout(() => {
            if (isActiveRef.current) {
              attemptReconnection(attempt + 1);
            }
          }, delay);
        }
      }
    },
    [
      maxAttempts,
      delays,
      reconnectFn,
      onReconnectAttempt,
      onReconnectSuccess,
      onReconnectFailed,
    ]
  );

  /**
   * Start reconnection process
   */
  const startReconnection = useCallback(() => {
    if (isReconnecting) return;

    isActiveRef.current = true;
    setIsReconnecting(true);
    attemptReconnection(0);
  }, [isReconnecting, attemptReconnection]);

  /**
   * Stop reconnection process
   */
  const stopReconnection = useCallback(() => {
    isActiveRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsReconnecting(false);
  }, []);

  /**
   * Reset attempt counter
   */
  const resetAttempts = useCallback(() => {
    setReconnectAttempt(0);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopReconnection();
    };
  }, [stopReconnection]);

  return {
    connectionState,
    reconnectAttempt,
    isReconnecting,
    startReconnection,
    stopReconnection,
    resetAttempts,
  };
}
