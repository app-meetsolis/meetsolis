'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  CalendarConnectionStatus,
  CalendarEventWithClient,
} from '@meetsolis/shared';
import { MatchClientModal } from './MatchClientModal';
import { UpcomingSessionRow } from './UpcomingSessionRow';

async function fetchStatus(): Promise<CalendarConnectionStatus> {
  const res = await fetch('/api/calendar/status');
  if (!res.ok) throw new Error('Failed to load status');
  return res.json();
}

async function fetchIsPro(): Promise<boolean> {
  const res = await fetch('/api/usage');
  if (!res.ok) return false;
  const body = await res.json();
  return body.tier === 'pro';
}

async function fetchAutoTranscribe(): Promise<boolean> {
  const res = await fetch('/api/user/preferences');
  if (!res.ok) return false;
  const body = await res.json();
  return Boolean(body.auto_transcribe_enabled);
}

async function fetchEvents(): Promise<CalendarEventWithClient[]> {
  const res = await fetch('/api/calendar/events?limit=20');
  if (!res.ok) return [];
  const body = (await res.json()) as { events: CalendarEventWithClient[] };
  return body.events ?? [];
}

async function triggerSync(): Promise<{
  fetched: number;
  upserted: number;
  matched: number;
  deleted: number;
}> {
  const res = await fetch('/api/calendar/sync', { method: 'POST' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Sync failed');
  }
  return {
    fetched: body.fetched ?? 0,
    upserted: body.upserted ?? 0,
    matched: body.matched ?? 0,
    deleted: body.deleted ?? 0,
  };
}

export function UpcomingSessionsCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [matchEvent, setMatchEvent] = useState<CalendarEventWithClient | null>(
    null
  );

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: fetchStatus,
  });

  const { data: isPro = false } = useQuery({
    queryKey: ['is-pro'],
    queryFn: fetchIsPro,
  });

  const { data: autoTranscribeEnabled = false } = useQuery({
    queryKey: ['user-preferences', 'auto-transcribe'],
    queryFn: fetchAutoTranscribe,
  });

  const isConnected = Boolean(status?.connected);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchEvents,
    enabled: isConnected,
  });

  const sync = useMutation({
    mutationFn: triggerSync,
    onSuccess: async result => {
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      const { fetched, upserted, matched, deleted } = result;
      if (fetched === 0) {
        toast.warning(
          'No events returned from Google. Check that the meeting has a Meet link and is on your primary calendar.'
        );
      } else {
        toast.success(
          `Synced: fetched ${fetched}, saved ${upserted}, matched ${matched}${deleted ? `, removed ${deleted}` : ''}`
        );
      }
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    },
  });

  // Auto-sync once when dashboard mounts (silent, no toast)
  const autoSyncedRef = useRef(false);
  useEffect(() => {
    if (!isConnected || autoSyncedRef.current) return;
    autoSyncedRef.current = true;
    fetch('/api/calendar/sync', { method: 'POST' })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      )
      .catch(() => {});
  }, [isConnected, queryClient]);

  if (statusLoading || (isConnected && eventsLoading)) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Sessions
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[15px] font-semibold text-foreground">
            Sessions
          </h3>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground">
            Connect Google Calendar to see your sessions.
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/settings/preferences')}
            className="shrink-0 h-8 text-[12px]"
          >
            Connect
          </Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Sessions
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className="h-7 text-[12px] gap-1.5"
          >
            <RefreshCw
              className={`h-3 w-3 ${sync.isPending ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          No sessions in the last 24 hours or upcoming.
        </p>
      </div>
    );
  }

  const now = Date.now();

  return (
    <>
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Sessions
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            className="h-7 text-[12px] gap-1.5"
          >
            <RefreshCw
              className={`h-3 w-3 ${sync.isPending ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        <ul className="space-y-1.5 max-h-[340px] overflow-y-auto -mr-2 pr-2">
          {events.map(evt => {
            const isMatched = Boolean(evt.client_id && evt.client_name);
            const isPast = new Date(evt.start_time).getTime() < now;
            return (
              <UpcomingSessionRow
                key={evt.id}
                event={evt}
                isPro={isPro}
                autoTranscribeEnabled={autoTranscribeEnabled}
                isPast={isPast}
                onOpenMatch={() => setMatchEvent(evt)}
                onRowClick={() => {
                  if (!isMatched) {
                    setMatchEvent(evt);
                  } else if (isPro) {
                    router.push(`/brief/${evt.id}`);
                  } else {
                    router.push(`/clients/${evt.client_id}`);
                  }
                }}
              />
            );
          })}
        </ul>
      </div>

      {matchEvent && (
        <MatchClientModal
          event={matchEvent}
          onClose={() => setMatchEvent(null)}
          onMatched={async () => {
            setMatchEvent(null);
            await queryClient.invalidateQueries({
              queryKey: ['calendar-events'],
            });
          }}
        />
      )}
    </>
  );
}
