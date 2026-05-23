/**
 * useActiveSessions (Story 6.5)
 * Polls /api/sessions/active every 10s to detect sessions where the bot is
 * currently in-meeting. Powers the dashboard live transcript panel.
 */

import { useQuery } from '@tanstack/react-query';

export interface ActiveSession {
  session_id: string;
  recall_session_id: string;
  client_id: string | null;
  client_name: string | null;
  speaker_map: Record<string, string> | null;
  status: string;
}

async function fetchActive(): Promise<ActiveSession[]> {
  const res = await fetch('/api/sessions/active');
  if (!res.ok) return [];
  const body = (await res.json()) as { sessions: ActiveSession[] };
  return body.sessions ?? [];
}

export function useActiveSessions(enabled = true) {
  return useQuery<ActiveSession[]>({
    queryKey: ['sessions-active'],
    queryFn: fetchActive,
    refetchInterval: 10_000,
    enabled,
  });
}
