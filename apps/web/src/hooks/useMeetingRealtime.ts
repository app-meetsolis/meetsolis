/**
 * useMeetingRealtime Hook
 * Subscribes to Supabase Realtime for live meeting updates
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useMeetingRealtime() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        // Subscribe to meetings table changes
        channel = supabase
          .channel('meetings-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'meetings',
            },
            payload => {
              console.log('Realtime event received:', payload);

              // Invalidate react-query cache to refetch meetings
              queryClient.invalidateQueries({ queryKey: ['meetings'] });

              // If it's an update or delete, also invalidate the specific meeting
              if (
                payload.eventType === 'UPDATE' ||
                payload.eventType === 'DELETE'
              ) {
                const meetingId =
                  (payload.old as any)?.id || (payload.new as any)?.id;
                if (meetingId) {
                  queryClient.invalidateQueries({
                    queryKey: ['meetings', meetingId],
                  });
                }
              }
            }
          )
          .subscribe(status => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError('Realtime connection error');
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false);
              setError('Realtime connection timed out');
            }
          });
      } catch (err) {
        console.error('Realtime setup error:', err);
        setError('Failed to setup realtime connection');
        setIsConnected(false);
      }
    };

    setupRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [supabase, queryClient]);

  return { isConnected, error };
}
