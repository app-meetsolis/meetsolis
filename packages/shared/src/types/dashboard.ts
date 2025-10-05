/**
 * Dashboard Type Definitions
 * Shared types for dashboard-related data and components
 */

export interface MeetingMetrics {
  total_meetings: number;
  total_meeting_hours: number;
  average_duration: number;
}

export interface DashboardStats {
  upcoming_meetings: number;
  past_meetings: number;
  active_meetings: number;
}
