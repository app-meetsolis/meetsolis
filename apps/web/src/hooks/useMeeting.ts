/**
 * useMeeting Hook
 * React Query hooks for meeting data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Meeting,
  Participant,
  JoinMeetingRequest,
} from '../../../../packages/shared/types/meeting';

/**
 * Fetch meeting by ID
 */
export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async (): Promise<{
      meeting: Meeting;
      participants: Participant[];
    }> => {
      const response = await fetch(`/api/meetings/${meetingId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meeting');
      }

      return response.json();
    },
    enabled: !!meetingId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Join a meeting
 */
export function useJoinMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      meetingId,
      role,
    }: JoinMeetingRequest & { meetingId: string }): Promise<Participant> => {
      const response = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join meeting');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate meeting query to refetch participants
      queryClient.invalidateQueries({
        queryKey: ['meeting', variables.meetingId],
      });
    },
  });
}

/**
 * Leave a meeting
 */
export function useLeaveMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetingId }: { meetingId: string }): Promise<void> => {
      const response = await fetch(`/api/meetings/${meetingId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave meeting');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate meeting query
      queryClient.invalidateQueries({
        queryKey: ['meeting', variables.meetingId],
      });
    },
  });
}

/**
 * Update participant state (muted, video, etc.)
 */
export function useUpdateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      meetingId,
      updates,
    }: {
      meetingId: string;
      updates: Partial<Participant>;
    }): Promise<Participant> => {
      const response = await fetch(`/api/meetings/${meetingId}/participant`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update participant');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Optimistically update cache
      queryClient.setQueryData(
        ['meeting', variables.meetingId],
        (
          old: { meeting: Meeting; participants: Participant[] } | undefined
        ) => {
          if (!old) return old;

          return {
            ...old,
            participants: old.participants.map(p =>
              p.user_id === variables.updates.user_id
                ? { ...p, ...variables.updates }
                : p
            ),
          };
        }
      );
    },
  });
}
