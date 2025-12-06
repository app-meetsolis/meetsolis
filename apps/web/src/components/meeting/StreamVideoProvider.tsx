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

  /**
   * Initialize Stream Video client - runs once on mount
   */
  useEffect(() => {
    let videoClient: StreamVideoClient | null = null;
    let videoCall: any = null;

    const initializeClient = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey) {
          throw new Error('NEXT_PUBLIC_STREAM_API_KEY not configured');
        }

        console.log('[StreamVideoProvider] Initializing Stream client...');

        // Create a fresh Stream Video client
        videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: userName,
          },
          token,
        });

        // Create call instance
        const callId = generateCallId(meetingId);
        videoCall = videoClient.call('default', callId);

        // Join the call and request media permissions
        await videoCall.join({
          create: true,
          data: {
            members: [{ user_id: userId }],
          },
        });

        console.log(
          '[StreamVideoProvider] Call joined, enabling camera and mic...'
        );

        // Enable camera and microphone after join completes
        try {
          await videoCall.camera.enable();
          console.log('[StreamVideoProvider] Camera enabled');
        } catch (error) {
          console.warn('[StreamVideoProvider] Camera enable failed:', error);
        }

        try {
          await videoCall.microphone.enable();
          console.log('[StreamVideoProvider] Microphone enabled');
        } catch (error) {
          console.warn(
            '[StreamVideoProvider] Microphone enable failed:',
            error
          );
        }

        console.log('[StreamVideoProvider] Client initialized successfully');

        setClient(videoClient);
        setCall(videoCall);
      } catch (error) {
        console.error('[StreamVideoProvider] Initialization failed:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    initializeClient();

    // Cleanup on unmount
    return () => {
      console.log('[StreamVideoProvider] Cleaning up...');
      if (videoCall) {
        videoCall.leave().catch(console.error);
      }
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
  }, [meetingId, userId, userName, token, onError]);

  // Show loading state while initializing
  if (!client || !call) {
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
