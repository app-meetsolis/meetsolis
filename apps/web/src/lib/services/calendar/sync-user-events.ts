/**
 * Sync upcoming Google Calendar events for a single user (Story 6.1).
 *
 * Called by:
 *   - POST /api/calendar/sync (manual user trigger)
 *   - POST /api/calendar/sync-all (cron iterator)
 *   - GET /api/calendar/callback (initial sync after OAuth)
 *
 * Filters: only events with Meet/Zoom link OR attendee matching a Client Card email.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CalendarEventAttendee } from '@meetsolis/shared';
import {
  getValidAccessToken,
  listUpcomingEvents,
  extractMeetingLink,
} from './google-calendar';
import { matchEventToClient } from './match-client';

const SYNC_WINDOW_HOURS = 24;

export interface SyncResult {
  fetched: number;
  upserted: number;
  matched: number;
}

export async function syncUserEvents(
  supabase: SupabaseClient,
  userId: string
): Promise<SyncResult> {
  const accessToken = await getValidAccessToken(supabase, userId);

  const now = new Date();
  const timeMax = new Date(now.getTime() + SYNC_WINDOW_HOURS * 60 * 60 * 1000);

  const events = await listUpcomingEvents(accessToken, {
    timeMin: now,
    timeMax,
  });

  let upserted = 0;
  let matched = 0;

  for (const evt of events) {
    if (!evt.id || !evt.start?.dateTime || !evt.end?.dateTime) continue;

    const attendees: CalendarEventAttendee[] = (evt.attendees ?? [])
      .filter(a => a.email)
      .map(a => ({
        email: a.email as string,
        display_name: a.displayName ?? undefined,
        response_status:
          (a.responseStatus as CalendarEventAttendee['response_status']) ??
          undefined,
      }));

    const link = extractMeetingLink(evt);
    const attendeeEmails = attendees.map(a => a.email);
    const clientId = attendeeEmails.length
      ? await matchEventToClient(supabase, userId, attendeeEmails)
      : null;

    // Filter: must have meet link OR matched client (else not a coaching session)
    if (!link.url && !clientId) continue;

    const { error } = await supabase.from('calendar_events').upsert(
      {
        user_id: userId,
        google_event_id: evt.id,
        title: evt.summary ?? '(no title)',
        start_time: evt.start.dateTime,
        end_time: evt.end.dateTime,
        attendees,
        client_id: clientId,
        meet_link: link.url,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,google_event_id' }
    );

    if (!error) {
      upserted++;
      if (clientId) matched++;
    }
  }

  return { fetched: events.length, upserted, matched };
}
