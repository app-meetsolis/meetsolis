/**
 * Meeting Type Definitions
 * Shared types for meeting functionality across the application
 */

export type MeetingStatus = 'scheduled' | 'active' | 'ended';
export type ParticipantRole = 'host' | 'co-host' | 'participant';
export type ParticipantStatus = 'waiting' | 'joined' | 'left' | 'kicked';
export type ConnectionQuality = 'excellent' | 'good' | 'poor';

export interface MeetingSettings {
  allow_screen_share: boolean;
  allow_whiteboard: boolean;
  allow_file_upload: boolean;
  auto_record: boolean;
  enable_reactions: boolean;
  enable_polls: boolean;
  background_blur_default: boolean;
}

export interface ParticipantPermissions {
  can_share_screen: boolean;
  can_use_whiteboard: boolean;
  can_upload_files: boolean;
  can_send_messages: boolean;
  can_create_polls: boolean;
  can_use_reactions: boolean;
}

export interface Meeting {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  status: MeetingStatus;
  scheduled_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  settings: MeetingSettings;
  meeting_code: string;
  invite_link: string;
  waiting_room_enabled: boolean;
  locked: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: ParticipantRole;
  join_time: string | null;
  leave_time: string | null;
  is_muted: boolean;
  is_video_off: boolean;
  permissions: ParticipantPermissions;
  connection_quality: ConnectionQuality;
  created_at: string;
  updated_at: string;
}

export interface MeetingState {
  current: Meeting | null;
  participants: Participant[];
  status: 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'ended';
}

/**
 * API Request/Response Types
 */

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  scheduled_start?: string;
}

export interface CreateMeetingResponse {
  meeting: Meeting;
}

export interface JoinMeetingRequest {
  user_id: string;
  role?: ParticipantRole;
}

export interface JoinMeetingResponse {
  participant: Participant;
}

export interface GetMeetingResponse {
  meeting: Meeting;
  participants: Participant[];
}
