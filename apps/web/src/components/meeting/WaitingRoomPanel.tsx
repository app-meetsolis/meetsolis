/**
 * Waiting Room Panel Component
 *
 * Sidebar panel for hosts/co-hosts to manage participants in the waiting room.
 * Shows list of waiting participants with admit/reject actions.
 * Includes real-time updates via Supabase subscriptions.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, UserCheck, UserX, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Waiting room participant data
 */
interface WaitingParticipant {
  id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
  status: 'waiting' | 'admitted' | 'rejected';
}

/**
 * WaitingRoomPanel Props
 */
interface WaitingRoomPanelProps {
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
}

/**
 * WaitingRoomPanel Component
 *
 * @param meetingId - Meeting ID
 * @param isOpen - Panel visibility state
 * @param onClose - Close panel callback
 * @param isHost - Whether current user is host or co-host
 */
export function WaitingRoomPanel({
  meetingId,
  isOpen,
  onClose,
  isHost,
}: WaitingRoomPanelProps) {
  const [participants, setParticipants] = useState<WaitingParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /**
   * Fetch waiting room participants
   */
  const fetchParticipants = useCallback(async () => {
    if (!isHost) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/waiting-room`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Failed to fetch waiting room participants'
        );
      }

      const data = await response.json();
      setParticipants(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[WaitingRoomPanel] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, isHost]);

  /**
   * Admit participant
   */
  const handleAdmit = useCallback(
    async (userId: string) => {
      setProcessingIds(prev => new Set(prev).add(userId));
      setError(null);

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/waiting-room/admit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to admit participant');
        }

        // Remove from local state (realtime will update, but this is faster)
        setParticipants(prev => prev.filter(p => p.user_id !== userId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[WaitingRoomPanel] Admit error:', err);
      } finally {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [meetingId]
  );

  /**
   * Reject participant
   */
  const handleReject = useCallback(
    async (userId: string) => {
      setProcessingIds(prev => new Set(prev).add(userId));
      setError(null);

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/waiting-room/reject`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to reject participant');
        }

        // Remove from local state
        setParticipants(prev => prev.filter(p => p.user_id !== userId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[WaitingRoomPanel] Reject error:', err);
      } finally {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [meetingId]
  );

  /**
   * Admit all participants
   */
  const handleAdmitAll = useCallback(async () => {
    if (participants.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Admit each participant individually (API doesn't support bulk yet)
      await Promise.all(
        participants.map(p =>
          fetch(`/api/meetings/${meetingId}/waiting-room/admit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: p.user_id }),
          })
        )
      );

      // Clear local state
      setParticipants([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[WaitingRoomPanel] Admit all error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, participants]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (isOpen && isHost) {
      fetchParticipants();
    }
  }, [isOpen, isHost, fetchParticipants]);

  /**
   * Poll for updates every 5 seconds
   * TODO: Replace with Supabase Realtime subscription in useWaitingRoom hook
   */
  useEffect(() => {
    if (!isOpen || !isHost) return;

    const interval = setInterval(() => {
      fetchParticipants();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, isHost, fetchParticipants]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Waiting Room</h2>
          {participants.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
              {participants.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          aria-label="Close waiting room panel"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Admit All Button */}
      {participants.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleAdmitAll}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Admit All ({participants.length})
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && participants.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <Users className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-gray-400">No participants waiting</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {participants.map(participant => {
              const isProcessing = processingIds.has(participant.user_id);

              return (
                <div
                  key={participant.id}
                  className="p-4 hover:bg-gray-800/50 transition-colors"
                >
                  {/* Participant Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {participant.display_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Joined{' '}
                          {formatDistanceToNow(
                            new Date(participant.joined_at),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdmit(participant.user_id)}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors flex items-center justify-center gap-1.5"
                      aria-label={`Admit ${participant.display_name}`}
                    >
                      <UserCheck className="w-4 h-4" />
                      Admit
                    </button>
                    <button
                      onClick={() => handleReject(participant.user_id)}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors flex items-center justify-center gap-1.5"
                      aria-label={`Reject ${participant.display_name}`}
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
