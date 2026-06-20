/**
 * Story 7.6 — Action Items Carry-Forward types.
 *
 * `OpenActionItem` is the enriched shape returned by the open-items lib:
 * a non-completed action_item joined with its source session + client, plus
 * the computed `open_session_count` (from the get_open_session_count SQL fn).
 */

import type { ActionItemAssignee } from './database';

export interface OpenActionItem {
  id: string;
  description: string;
  assignee: ActionItemAssignee | null;
  source_session_id: string | null;
  source_session_date: string | null;
  source_session_title: string | null;
  open_session_count: number;
  client_id: string;
  client_name: string;
}

/** Dashboard aggregate across all of a coach's clients. */
export interface OpenItemsAcrossClients {
  totalCount: number;
  topItems: OpenActionItem[];
  clientsAffected: number;
}
