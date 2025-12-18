/**
 * Waiting Room View Component
 *
 * Full-screen view shown to participants while waiting to be admitted to a meeting.
 * Listens for admission/rejection events via Supabase Realtime.
 * Auto-redirects to meeting on admission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { subscribeToMeetingEvents } from '@/lib/supabase/realtime';
import type { WaitingRoomEventPayload } from '../../../../../packages/shared/types/realtime';

/**
 * WaitingRoomView Props
 */
interface WaitingRoomViewProps {
  meetingId: string;
  meetingTitle: string;
  hostName?: string;
  currentUserId: string;
  onAdmitted?: () => void;
}

/**
 * WaitingRoomView Component
 *
 * Displays waiting state and handles admission/rejection events.
 *
 * @param meetingId - Meeting ID
 * @param meetingTitle - Title of the meeting
 * @param hostName - Name of the meeting host (optional)
 * @param currentUserId - Current user's Supabase user ID
 * @param onAdmitted - Callback when user is admitted (optional, defaults to redirect)
 */
export function WaitingRoomView({
  meetingId,
  meetingTitle,
  hostName,
  currentUserId,
  onAdmitted,
}: WaitingRoomViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'waiting' | 'admitted' | 'rejected'>(
    'waiting'
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Subscribe to waiting room events
   */
  useEffect(() => {
    console.log('[WaitingRoomView] Subscribing to events:', {
      meetingId,
      currentUserId,
    });

    const channel = subscribeToMeetingEvents(meetingId, {
      onWaitingRoomEvent: (payload: WaitingRoomEventPayload | null) => {
        if (!payload) {
          console.warn('[WaitingRoomView] Received null payload');
          return;
        }

        console.log('[WaitingRoomView] Event received:', payload);

        // Only handle events for current user
        if (payload.user_id !== currentUserId) {
          console.log('[WaitingRoomView] Event not for current user, ignoring');
          return;
        }

        if (payload.status === 'admitted') {
          console.log('[WaitingRoomView] Admitted! Redirecting...');
          setStatus('admitted');

          // Auto-redirect or call callback
          if (onAdmitted) {
            onAdmitted();
          } else {
            // Refresh the page to trigger meeting join logic
            setTimeout(() => {
              router.refresh();
            }, 1000);
          }
        } else if (payload.status === 'rejected') {
          console.log('[WaitingRoomView] Rejected');
          setStatus('rejected');
          setError('The host has denied your request to join this meeting.');
        }
      },
      onMeetingEnded: payload => {
        if (!payload) return;

        console.log(
          '[WaitingRoomView] Meeting ended while in waiting room:',
          payload
        );

        setError(
          payload.ended_by_host
            ? 'The meeting has been ended by the host.'
            : 'The meeting has ended.'
        );
        setStatus('rejected');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      },
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('[WaitingRoomView] Unsubscribing from events');
      channel.unsubscribe();
    };
  }, [meetingId, currentUserId, router, onAdmitted]);

  /**
   * Handle leave waiting room
   */
  const handleLeave = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Status Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
          {/* Icon */}
          <div className="mb-6">
            {status === 'waiting' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full animate-pulse">
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
            )}
            {status === 'admitted' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
                <Users className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === 'rejected' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Meeting Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {meetingTitle}
            </h1>
            {hostName && (
              <p className="text-gray-400">
                Hosted by{' '}
                <span className="text-white font-medium">{hostName}</span>
              </p>
            )}
          </div>

          {/* Status Message */}
          {status === 'waiting' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 font-medium mb-2">
                  Waiting for the host to let you in
                </p>
                <p className="text-sm text-gray-400">
                  The meeting host will admit you shortly. Please wait...
                </p>
              </div>

              {/* Loading indicator */}
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {status === 'admitted' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-300 font-medium mb-2">
                You&apos;ve been admitted!
              </p>
              <p className="text-sm text-gray-400">
                Joining the meeting now...
              </p>
            </div>
          )}

          {status === 'rejected' && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 font-medium mb-2">
                Unable to join meeting
              </p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          {status !== 'admitted' && (
            <div className="mt-6">
              <button
                onClick={handleLeave}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Leave Waiting Room
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {status === 'waiting' && (
              <>
                Having trouble?{' '}
                <a href="/help" className="text-blue-400 hover:underline">
                  Get help
                </a>
              </>
            )}
            {status === 'rejected' && (
              <>Contact the meeting host if you think this is a mistake.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
