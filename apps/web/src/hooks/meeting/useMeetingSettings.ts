/**
 * useMeetingSettings Hook
 * Real-time meeting settings subscription with toast notifications
 * Story 2.4 - Meeting Settings Control
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface MeetingSettings {
  chat_enabled?: boolean;
  private_chat_enabled?: boolean;
  file_uploads_enabled?: boolean;
}

export interface UseMeetingSettingsOptions {
  meetingId: string; // Can be UUID or meeting_code
  enabled?: boolean;
}

export interface UseMeetingSettingsResult {
  settings: MeetingSettings | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMeetingSettings({
  meetingId,
  enabled = true,
}: UseMeetingSettingsOptions): UseMeetingSettingsResult {
  const [settings, setSettings] = useState<MeetingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actualMeetingId, setActualMeetingId] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<any>(null);
  const previousSettingsRef = useRef<MeetingSettings | null>(null);

  // Initialize Supabase client
  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(supabaseUrl, supabaseKey);
    }
  }, []);

  // Resolve meeting_code to UUID
  useEffect(() => {
    if (!enabled) return;

    const resolveId = async () => {
      try {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            meetingId
          );

        if (isUUID) {
          setActualMeetingId(meetingId);
          return;
        }

        // Lookup meeting UUID by meeting_code
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (!response.ok) throw new Error('Failed to resolve meeting ID');

        const data = await response.json();
        setActualMeetingId(data.meeting.id);
      } catch (err) {
        console.error('Failed to resolve meeting ID:', err);
        setError(err as Error);
      }
    };

    resolveId();
  }, [meetingId, enabled]);

  // Fetch initial settings
  const fetchSettings = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/meetings/${meetingId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch meeting settings');
      }

      const { meeting } = await response.json();
      const newSettings = meeting.settings || {};
      setSettings(newSettings);
      previousSettingsRef.current = newSettings;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, enabled]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!enabled || !supabaseRef.current || !actualMeetingId) return;

    console.log('[useMeetingSettings] 🔌 Setting up Realtime subscription:', {
      meetingId,
      actualMeetingId,
      channelName: `meeting:${actualMeetingId}:settings`,
    });

    fetchSettings();

    // Create Realtime channel using actual UUID (broadcast mode - no RLS required)
    const channel = supabaseRef.current
      .channel(`meeting:${actualMeetingId}:settings`)
      .on('broadcast', { event: 'settings_updated' }, payload => {
        console.log('[useMeetingSettings] 🔔 Broadcast received:', {
          meetingId: actualMeetingId,
          payload,
          timestamp: new Date().toISOString(),
        });

        const newSettings = payload.payload.settings || {};
        const prevSettings = previousSettingsRef.current || {};

        console.log('[useMeetingSettings] Settings comparison:', {
          prevSettings,
          newSettings,
          changed: {
            chat: prevSettings.chat_enabled !== newSettings.chat_enabled,
            private_chat:
              prevSettings.private_chat_enabled !==
              newSettings.private_chat_enabled,
            file_uploads:
              prevSettings.file_uploads_enabled !==
              newSettings.file_uploads_enabled,
          },
        });

        // Show toast notifications for changes
        if (prevSettings.chat_enabled !== newSettings.chat_enabled) {
          toast.info(
            newSettings.chat_enabled
              ? 'Public chat has been enabled by the host'
              : 'Public chat has been disabled by the host',
            { duration: 4000 }
          );
        }

        if (
          prevSettings.private_chat_enabled !== newSettings.private_chat_enabled
        ) {
          toast.info(
            newSettings.private_chat_enabled
              ? 'Private chat has been enabled by the host'
              : 'Private chat has been disabled by the host',
            { duration: 4000 }
          );
        }

        if (
          prevSettings.file_uploads_enabled !== newSettings.file_uploads_enabled
        ) {
          toast.info(
            newSettings.file_uploads_enabled
              ? 'File uploads have been enabled by the host'
              : 'File uploads has been disabled by the host',
            { duration: 4000 }
          );
        }

        setSettings(newSettings);
        previousSettingsRef.current = newSettings;
      })
      .subscribe(status => {
        console.log('[useMeetingSettings] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log(
            '[useMeetingSettings] ✅ Successfully subscribed to settings updates'
          );
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('[useMeetingSettings] ❌ Subscription failed:', status);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabaseRef.current?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [actualMeetingId, enabled, fetchSettings]);

  return {
    settings,
    isLoading,
    error,
  };
}
