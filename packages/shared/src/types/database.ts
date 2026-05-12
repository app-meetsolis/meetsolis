/**
 * Database Types
 *
 * Type definitions for Supabase database tables.
 * These types mirror the database schema for type-safe queries.
 */

// =============================================================================
// USER TYPES
// =============================================================================
// Note: UserRole, UserPreferences, and User are defined in auth.ts
// Import them from there to avoid duplication

import type { User, UserRole, UserPreferences } from './auth';

export interface UserInsert {
  clerk_id: string;
  email: string;
  name?: string | null;
  role?: UserRole;
  verified_badge?: boolean;
  preferences?: UserPreferences;
}

export interface UserUpdate {
  email?: string;
  name?: string | null;
  role?: UserRole;
  verified_badge?: boolean;
  preferences?: UserPreferences;
}

// =============================================================================
// MEETING TYPES
// =============================================================================

export type MeetingStatus = 'scheduled' | 'active' | 'ended';

export interface MeetingSettings {
  allow_screen_share?: boolean;
  allow_recording?: boolean;
  allow_chat?: boolean;
  allow_reactions?: boolean;
  chat_enabled?: boolean;
  private_chat_enabled?: boolean;
  file_uploads_enabled?: boolean;
  allow_participant_screenshare?: boolean; // Story 2.5 - Screen share permissions
  max_participants?: number;
  enable_waiting_room?: boolean;
  enable_translation?: boolean;
  enable_transcription?: boolean;
}

export interface Meeting {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  status: MeetingStatus;
  settings: MeetingSettings;
  invite_link: string;
  invite_token?: string; // Story 2.5 - Secure invite token
  expires_at?: string | null; // Story 2.5 - Link expiration
  waiting_room_whitelist?: string[]; // Story 2.5 - Auto-admit emails
  allow_participant_screenshare?: boolean; // Story 2.5 - Screen share permissions
  waiting_room_enabled: boolean;
  locked: boolean;
  max_participants: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingInsert {
  host_id: string;
  title: string;
  description?: string | null;
  status?: MeetingStatus;
  settings?: MeetingSettings;
  invite_link: string;
  invite_token?: string; // Story 2.5 - Secure invite token
  expires_at?: string | null; // Story 2.5 - Link expiration
  expiresIn?: 'never' | '24h' | '7d' | '30d'; // Story 2.5 - Expiration period (API input)
  waiting_room_whitelist?: string[]; // Story 2.5 - Auto-admit emails
  allow_participant_screenshare?: boolean; // Story 2.5 - Screen share permissions
  waiting_room_enabled?: boolean;
  locked?: boolean;
  max_participants?: number;
}

export interface MeetingUpdate {
  title?: string;
  description?: string | null;
  status?: MeetingStatus;
  settings?: MeetingSettings;
  invite_token?: string; // Story 2.5 - Secure invite token
  expires_at?: string | null; // Story 2.5 - Link expiration
  waiting_room_whitelist?: string[]; // Story 2.5 - Auto-admit emails
  allow_participant_screenshare?: boolean; // Story 2.5 - Screen share permissions
  waiting_room_enabled?: boolean;
  locked?: boolean;
  max_participants?: number;
  started_at?: string | null;
  ended_at?: string | null;
}

// =============================================================================
// PARTICIPANT TYPES
// =============================================================================

export type ParticipantRole = 'host' | 'co-host' | 'participant';
export type ParticipantStatus = 'waiting' | 'joined' | 'left' | 'kicked';

export interface ParticipantPermissions {
  can_share_screen?: boolean;
  can_record?: boolean;
  can_mute_others?: boolean;
  can_remove_participants?: boolean;
  can_end_meeting?: boolean;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  status: ParticipantStatus;
  hand_raised: boolean;
  hand_raised_at: string | null;
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantInsert {
  meeting_id: string;
  user_id: string;
  role?: ParticipantRole;
  permissions?: ParticipantPermissions;
  status?: ParticipantStatus;
}

export interface ParticipantUpdate {
  role?: ParticipantRole;
  permissions?: ParticipantPermissions;
  status?: ParticipantStatus;
  joined_at?: string | null;
  left_at?: string | null;
}

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export type MessageType = 'public' | 'private' | 'system' | 'text' | 'file';

export interface MessageReadReceipt {
  user_id: string;
  read_at: string;
}

export interface MessageMetadata {
  file_id?: string;
  file_name?: string;
  file_url?: string;
  system_event?: string;
  translated?: boolean;
  original_language?: string;
}

export interface Message {
  id: string;
  meeting_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  recipient_id?: string | null;
  timestamp: string;
  edited_at?: string | null;
  is_deleted: boolean;
  message_read_by: MessageReadReceipt[];
  file_id?: string | null;
  metadata: MessageMetadata;
  created_at: string;
}

export interface MessageInsert {
  meeting_id: string;
  sender_id: string;
  content: string;
  type?: MessageType;
  recipient_id?: string | null;
  file_id?: string | null;
  metadata?: MessageMetadata;
}

// =============================================================================
// REACTION TYPES
// =============================================================================

export interface Reaction {
  id: string;
  meeting_id: string;
  user_id: string;
  emoji: string;
  message_id?: string | null;
  created_at: string;
}

export interface ReactionInsert {
  meeting_id: string;
  user_id: string;
  emoji: string;
  message_id?: string | null;
}

// =============================================================================
// FILE TYPES
// =============================================================================

export interface File {
  id: string;
  meeting_id: string;
  user_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  deleted: boolean;
  expires_at: string;
  created_at: string;
}

export interface FileInsert {
  meeting_id: string;
  user_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  expires_at: string;
}

export interface FileUpdate {
  deleted?: boolean;
}

// =============================================================================
// MEETING SUMMARY TYPES
// =============================================================================

export interface MeetingSummary {
  id: string;
  meeting_id: string;
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
  ai_model: string;
  created_at: string;
}

export interface ActionItem {
  description: string;
  assigned_to?: string;
  due_date?: string;
  completed?: boolean;
}

export interface MeetingSummaryInsert {
  meeting_id: string;
  summary: string;
  key_points?: string[];
  action_items?: ActionItem[];
  ai_model?: string;
}

// =============================================================================
// AI USAGE TRACKING TYPES
// =============================================================================

export type AIFeature = 'summary' | 'translation' | 'transcription';

export interface AIUsageTracking {
  id: string;
  user_id: string;
  feature: AIFeature;
  tokens_used: number;
  cost_usd: number;
  created_at: string;
}

export interface AIUsageTrackingInsert {
  user_id: string;
  feature: AIFeature;
  tokens_used: number;
  cost_usd?: number;
}

// =============================================================================
// USAGE ALERTS TYPES
// =============================================================================

export type AlertType =
  | 'file_cleanup'
  | 'ai_quota_warning'
  | 'ai_quota_exceeded'
  | 'backup_failure'
  | 'security_event';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface UsageAlert {
  id: string;
  alert_type: AlertType;
  message: string;
  severity: AlertSeverity;
  metadata: Record<string, any>;
  resolved: boolean;
  created_at: string;
}

export interface UsageAlertInsert {
  alert_type: AlertType;
  message: string;
  severity?: AlertSeverity;
  metadata?: Record<string, any>;
}

export interface UsageAlertUpdate {
  resolved?: boolean;
}

// =============================================================================
// CLIENT ACTION ITEM TYPES (Story 2.6)
// =============================================================================

export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ActionItemAssignee = 'coach' | 'client';

export interface ClientActionItem {
  id: string;
  session_id: string | null;
  client_id: string;
  user_id: string;
  description: string;
  status: ActionItemStatus;
  assignee: ActionItemAssignee | null;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientActionItemInsert {
  client_id: string;
  description: string;
  assignee?: ActionItemAssignee | null;
  status?: ActionItemStatus;
}

export interface ClientActionItemUpdate {
  description?: string;
  status?: ActionItemStatus;
  assignee?: ActionItemAssignee | null;
  completed_at?: string | null;
}

// =============================================================================
// COMPOSITE TYPES (WITH RELATIONS)
// =============================================================================

export interface MeetingWithHost extends Meeting {
  host: User;
}

export interface MeetingWithParticipants extends Meeting {
  participants: (Participant & { user: User })[];
}

export interface ParticipantWithUser extends Participant {
  user: User;
}

export interface MessageWithUser extends Message {
  sender: User;
  recipient?: User | null;
}

export interface ReactionWithUser extends Reaction {
  user: User;
}

export interface FileWithUser extends File {
  user: User;
}

// =============================================================================
// SESSION TYPES (Story 3.1)
// =============================================================================

export type SessionStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface Session {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  session_date: string;
  transcript_text: string | null;
  transcript_file_url: string | null;
  transcript_audio_url: string | null;
  summary: string | null;
  key_topics: string[];
  embedding: number[] | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  action_items?: { id: string; status: string }[];
}

export interface SessionInsert {
  client_id: string;
  user_id: string;
  title: string;
  session_date: string;
  transcript_text?: string | null;
  transcript_file_url?: string | null;
  transcript_audio_url?: string | null;
  summary?: string | null;
  key_topics?: string[];
  status?: SessionStatus;
}

export interface SessionUpdate {
  title?: string;
  session_date?: string;
  transcript_text?: string | null;
  transcript_file_url?: string | null;
  transcript_audio_url?: string | null;
  summary?: string | null;
  key_topics?: string[];
  status?: SessionStatus;
  updated_at?: string;
}

// =============================================================================
// BILLING / SUBSCRIPTION TYPES (Story 4.4)
// =============================================================================

export type SubscriptionPlan = 'free' | 'pro';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: string;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  dodo_product_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  transcript_count: number;
  transcript_reset_at: string | null;
  query_count: number;
  query_reset_at: string | null;
  // Story 6.2 — Recall.ai bot session quota
  bot_session_count: number;
  bot_session_count_period_start: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageResponse {
  tier: SubscriptionPlan;
  transcript_count: number;
  transcript_limit: number;
  query_count: number;
  query_limit: number;
  client_count: number;
  client_limit: number;
  resets_at: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

// =============================================================================
// SOLIS Q&A TYPES (Story 4.2)
// =============================================================================

export interface SolisCitation {
  session_id: string;
  session_date: string;
  title: string;
}

export interface SolisQueryResponse {
  answer: string;
  citations: SolisCitation[];
}

export interface SolisQueryInsert {
  user_id: string;
  client_id: string | null;
  query: string;
  response: string;
  citations: SolisCitation[];
}
