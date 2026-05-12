/**
 * Match calendar event attendees to Client Cards by email (Story 6.1).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns the first matching client_id for any of the given attendee emails.
 * Case-insensitive email comparison. Active clients only.
 */
export async function matchEventToClient(
  supabase: SupabaseClient,
  userId: string,
  attendeeEmails: string[]
): Promise<string | null> {
  const normalized = attendeeEmails
    .map(e => e?.trim().toLowerCase())
    .filter((e): e is string => Boolean(e));

  if (normalized.length === 0) return null;

  const { data } = await supabase
    .from('clients')
    .select('id, email')
    .eq('user_id', userId)
    .not('email', 'is', null);

  if (!data || data.length === 0) return null;

  for (const client of data) {
    const clientEmail = (client.email as string | null)?.trim().toLowerCase();
    if (clientEmail && normalized.includes(clientEmail)) {
      return client.id as string;
    }
  }
  return null;
}
