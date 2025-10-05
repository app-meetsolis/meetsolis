/**
 * useMeetings Hook
 * React Query hook for managing meeting data with caching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { MeetingInsert, MeetingUpdate } from '@meetsolis/shared';
import {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  type MeetingFilters,
} from '@/services/meetings';

/**
 * Fetch all meetings with optional filters
 */
export function useMeetings(filters?: MeetingFilters) {
  return useQuery({
    queryKey: ['meetings', filters],
    queryFn: () => getMeetings(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch a single meeting by ID
 */
export function useMeeting(id: string) {
  return useQuery({
    queryKey: ['meetings', id],
    queryFn: () => getMeetingById(id),
    enabled: !!id,
  });
}

/**
 * Create a new meeting
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MeetingInsert>) => createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting created successfully!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Failed to create meeting';
      toast.error(message);
    },
  });
}

/**
 * Update an existing meeting
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MeetingUpdate }) =>
      updateMeeting(id, data),
    onSuccess: updatedMeeting => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({
        queryKey: ['meetings', updatedMeeting.id],
      });
      toast.success('Meeting updated successfully!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Failed to update meeting';
      toast.error(message);
    },
  });
}

/**
 * Delete a meeting
 */
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting deleted successfully!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Failed to delete meeting';
      toast.error(message);
    },
  });
}
