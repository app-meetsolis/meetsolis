/**
 * StreamVideoProvider Component
 * Wraps the Stream Video SDK provider for proper React integration
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { generateCallId } from '@/lib/stream/utils';

export interface StreamVideoProviderProps {
  meetingId: string;
  userId: string;
  userName: string;
  token: string;
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

/**
 * StreamVideoProvider Component
 * Provides Stream Video client and call context to children
 */
export function StreamVideoProvider({
  meetingId,
  userId,
  userName,
  token,
  children,
  onError,
}: StreamVideoProviderProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize Stream Video client
   */
  const initializeClient = useCallback(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_STREAM_API_KEY not configured');
      }

      console.log('[StreamVideoProvider] Initializing Stream client...');

      // Get or create Stream Video client (prevents duplicate instances)
      const videoClient = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user: {
          id: userId,
          name: userName,
        },
        token,
      });

      // Create call instance
      const callId = generateCallId(meetingId);
      const videoCall = videoClient.call('default', callId);

      // Join the call (create if doesn't exist)
      await videoCall.join({ create: true });

      // Explicitly enable camera and microphone after joining
      await videoCall.camera.enable();
      await videoCall.microphone.enable();

      console.log('[StreamVideoProvider] Client initialized successfully');

      setClient(videoClient);
      setCall(videoCall);
      setIsInitialized(true);
    } catch (error) {
      console.error('[StreamVideoProvider] Initialization failed:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [meetingId, userId, userName, token, onError]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (!isInitialized) {
      initializeClient();
    }
  }, [isInitialized, initializeClient]);

  /**
   * Cleanup on unmount only
   */
  useEffect(() => {
    return () => {
      console.log('[StreamVideoProvider] Cleaning up...');
      // Leave call and disconnect client on unmount
      if (call) {
        call.leave().catch(console.error);
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on unmount

  // Show loading state while initializing
  if (!client || !call || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>{children}</StreamCall>
    </StreamVideo>
  );
}
