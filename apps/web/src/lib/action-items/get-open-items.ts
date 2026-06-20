/**
 * Story 7.6 — reusable open-action-item fetch.
 *
 * Returns non-completed action items enriched with their source session info
 * and the computed `open_session_count` (via the get_open_session_count SQL fn,
 * migration 035). Server-only — uses the service-role client; callers must
 * already have authorized the user/client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import type {
  OpenActionItem,
  OpenItemsAcrossClients,
  ActionItemAssignee,
} from '@meetsolis/shared';

function getSupabase(): SupabaseClient {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

// Shape PostgREST returns for our embedded select.
interface RawRow {
  id: string;
  description: string;
  assignee: ActionItemAssignee | null;
  session_id: string | null;
  client_id: string;
  sessions: { session_date: string; title: string | null } | null;
  clients: { name: string } | null;
}

const SELECT =
  'id, description, assignee, session_id, client_id, ' +
  'sessions:session_id (session_date, title), clients:client_id (name)';

/** Oldest source session first; items without a source session sort last. */
function bySourceDateAsc(a: RawRow, b: RawRow): number {
  const da = a.sessions?.session_date ?? null;
  const db = b.sessions?.session_date ?? null;
  if (da === db) return 0;
  if (da === null) return 1;
  if (db === null) return -1;
  return da < db ? -1 : 1;
}

async function withOpenCounts(
  supabase: SupabaseClient,
  rows: RawRow[]
): Promise<OpenActionItem[]> {
  return Promise.all(
    rows.map(async row => {
      let open_session_count = 0;
      if (row.session_id) {
        const { data } = await supabase.rpc('get_open_session_count', {
          item_id: row.id,
        });
        open_session_count = typeof data === 'number' ? data : 0;
      }
      return {
        id: row.id,
        description: row.description,
        assignee: row.assignee,
        source_session_id: row.session_id,
        source_session_date: row.sessions?.session_date ?? null,
        source_session_title: row.sessions?.title ?? null,
        open_session_count,
        client_id: row.client_id,
        client_name: row.clients?.name ?? '',
      };
    })
  );
}

export interface GetOpenItemsOpts {
  excludeSessionId?: string;
  assignee?: ActionItemAssignee;
}

/**
 * Open items for one client, oldest source session first.
 * Caller must verify the client belongs to the authed user first.
 */
export async function getOpenItemsForClient(
  clientId: string,
  opts: GetOpenItemsOpts = {}
): Promise<OpenActionItem[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('action_items')
    .select(SELECT)
    .eq('client_id', clientId)
    .eq('completed', false);

  if (opts.assignee) query = query.eq('assignee', opts.assignee);
  if (opts.excludeSessionId) {
    query = query.neq('session_id', opts.excludeSessionId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const rows = (data as unknown as RawRow[]).sort(bySourceDateAsc);
  return withOpenCounts(supabase, rows);
}

/**
 * Aggregate open items across all of a coach's clients (dashboard card).
 * `topItems` = 5 oldest-source-session items (urgency sort).
 */
export async function getOpenItemsAcrossClients(
  userId: string
): Promise<OpenItemsAcrossClients> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('action_items')
    .select(SELECT)
    .eq('user_id', userId)
    .eq('completed', false);

  if (error || !data) {
    return { totalCount: 0, topItems: [], clientsAffected: 0 };
  }

  const rows = (data as unknown as RawRow[]).sort(bySourceDateAsc);
  const clientsAffected = new Set(rows.map(r => r.client_id)).size;
  const topItems = await withOpenCounts(supabase, rows.slice(0, 5));

  return { totalCount: rows.length, topItems, clientsAffected };
}
