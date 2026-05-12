/**
 * Google Calendar Service (Story 6.1)
 * OAuth2 client construction, token refresh, events.list, revoke.
 */

import { google, calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { encryptToken, decryptToken } from './token-encryption';

const REFRESH_SKEW_MS = 5 * 60 * 1000; // refresh if token expires in <5 min

export function buildOAuth2Client(): OAuth2Client {
  const { clientId, clientSecret, calendarRedirectUri } = config.google;
  if (!clientId || !clientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for calendar integration'
    );
  }
  return new google.auth.OAuth2(clientId, clientSecret, calendarRedirectUri);
}

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
];

/**
 * Returns a valid access token for the given user.
 * Auto-refreshes if expiring within 5 min. Updates DB on refresh.
 * Throws if connection broken or refresh fails (marks broken in DB).
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: row, error } = await supabase
    .from('user_calendar_tokens')
    .select(
      'access_token_encrypted, refresh_token_encrypted, expiry_at, connection_broken'
    )
    .eq('user_id', userId)
    .single();

  if (error || !row) {
    throw new Error('Calendar not connected for this user');
  }
  if (row.connection_broken) {
    throw new Error('Calendar connection broken — reconnect required');
  }

  const expiryMs = new Date(row.expiry_at).getTime();
  const needsRefresh = expiryMs - Date.now() <= REFRESH_SKEW_MS;

  if (!needsRefresh) {
    return decryptToken(row.access_token_encrypted);
  }

  // Refresh
  const refreshToken = decryptToken(row.refresh_token_encrypted);
  const oauth2 = buildOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2.refreshAccessToken();
    if (!credentials.access_token || !credentials.expiry_date) {
      throw new Error('Google returned no access token on refresh');
    }
    const newAccess = credentials.access_token;
    const newRefresh = credentials.refresh_token ?? refreshToken;
    const newExpiry = new Date(credentials.expiry_date).toISOString();

    await supabase
      .from('user_calendar_tokens')
      .update({
        access_token_encrypted: encryptToken(newAccess),
        refresh_token_encrypted: encryptToken(newRefresh),
        expiry_at: newExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return newAccess;
  } catch (err) {
    await supabase
      .from('user_calendar_tokens')
      .update({
        connection_broken: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    throw new Error(
      `Calendar token refresh failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/** List upcoming events in [timeMin, timeMax). Single-occurrence (expands recurring). */
export async function listUpcomingEvents(
  accessToken: string,
  opts: { timeMin: Date; timeMax: Date }
): Promise<calendar_v3.Schema$Event[]> {
  const oauth2 = buildOAuth2Client();
  oauth2.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth: oauth2 });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: opts.timeMin.toISOString(),
    timeMax: opts.timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50,
  });

  return res.data.items ?? [];
}

/** Revoke a refresh token at Google (called on disconnect). */
export async function revokeToken(refreshToken: string): Promise<void> {
  const oauth2 = buildOAuth2Client();
  try {
    await oauth2.revokeToken(refreshToken);
  } catch {
    // Already-revoked tokens return 400 — swallow; we still delete the row.
  }
}

/** Extract Meet/Zoom link from event. Falls back to scanning description + location. */
export function extractMeetingLink(event: calendar_v3.Schema$Event): {
  type: 'meet' | 'zoom' | null;
  url: string | null;
} {
  if (event.hangoutLink) {
    return { type: 'meet', url: event.hangoutLink };
  }
  const haystack = `${event.description ?? ''} ${event.location ?? ''}`;
  const meetMatch = haystack.match(/https:\/\/meet\.google\.com\/[a-z0-9-]+/i);
  if (meetMatch) return { type: 'meet', url: meetMatch[0] };
  const zoomMatch = haystack.match(
    /https:\/\/[a-z0-9-]+\.zoom\.us\/j\/[0-9]+(\?[^\s]+)?/i
  );
  if (zoomMatch) return { type: 'zoom', url: zoomMatch[0] };
  return { type: null, url: null };
}
