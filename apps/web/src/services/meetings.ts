/**
 * Meeting Service Layer
 * Client-side service for meeting-related API calls
 */

import axios from 'axios';
import type {
  Meeting,
  MeetingInsert,
  MeetingUpdate,
  MeetingStatus,
} from '@meetsolis/shared';

export interface MeetingFilters {
  status?: MeetingStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Create axios instance for API calls
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all meetings for the current user (as host or participant)
 */
export async function getMeetings(
  filters?: MeetingFilters
): Promise<Meeting[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }
  if (filters?.dateTo) {
    params.append('dateTo', filters.dateTo);
  }

  const queryString = params.toString();
  const url = queryString ? `/meetings?${queryString}` : '/meetings';

  const response = await api.get<Meeting[]>(url);
  return response.data;
}

/**
 * Fetch a single meeting by ID
 */
export async function getMeetingById(id: string): Promise<Meeting> {
  const response = await api.get<Meeting>(`/meetings/${id}`);
  return response.data;
}

/**
 * Create a new meeting
 */
export async function createMeeting(
  data: Partial<MeetingInsert>
): Promise<Meeting> {
  const response = await api.post<Meeting>('/meetings', data);
  return response.data;
}

/**
 * Update an existing meeting
 */
export async function updateMeeting(
  id: string,
  data: MeetingUpdate
): Promise<Meeting> {
  const response = await api.patch<Meeting>(`/meetings/${id}`, data);
  return response.data;
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
  await api.delete(`/meetings/${id}`);
}
