/**
 * Calendar Integration Types (Story 6.1)
 * Mirrors schema from migration 024_calendar_integration.sql
 */

export interface UserCalendarToken {
  id: string;
  user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expiry_at: string; // ISO timestamp
  google_account_email: string;
  connection_broken: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventAttendee {
  email: string;
  display_name?: string;
  response_status?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  google_event_id: string;
  title: string;
  start_time: string; // ISO timestamp
  end_time: string;
  attendees: CalendarEventAttendee[];
  client_id: string | null;
  meet_link: string | null;
  bot_status: string | null;
  bot_skipped: boolean;
  synced_at: string;
  created_at: string;
}

/** Calendar event joined with client name (returned by GET /api/calendar/events) */
export interface CalendarEventWithClient extends CalendarEvent {
  client_name: string | null;
}

/** Returned by GET /api/calendar/status */
export interface CalendarConnectionStatus {
  connected: boolean;
  email?: string;
  connection_broken?: boolean;
}
