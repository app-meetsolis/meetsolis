'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  RefreshCw,
  Video,
  Link2,
  Plus,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Radio,
  SkipForward,
  AlertCircle,
} from 'lucide-react';
import {
  format,
  formatDistanceToNowStrict,
  differenceInMinutes,
  isToday,
  isTomorrow,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import type {
  CalendarConnectionStatus,
  CalendarEventWithClient,
  RecallBotStatus,
} from '@meetsolis/shared';
import { MatchClientModal } from './MatchClientModal';

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

async function fetchEvents(): Promise<CalendarEventWithClient[]> {
  const res = await fetch('/api/calendar/events?limit=3');
  if (!res.ok) return [];
  const body = (await res.json()) as { events: CalendarEventWithClient[] };
  return body.events ?? [];
}

async function triggerSync(): Promise<void> {
  const res = await fetch('/api/calendar/sync', { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Sync failed');
  }
}

function formatRelative(startTime: string): string {
  const date = new Date(startTime);
  const minutes = differenceInMinutes(date, new Date());

  if (minutes <= 0) return 'starting now';
  if (minutes < 60) return `in ${minutes} min`;
  if (isToday(date)) return `today ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `tomorrow ${format(date, 'h:mm a')}`;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

function PlatformIcon({ link }: { link: string | null }) {
  if (!link) return <Link2 className="h-3.5 w-3.5 text-muted-foreground" />;
  if (link.includes('meet.google.com'))
    return <Video className="h-3.5 w-3.5 text-emerald-500" />;
  if (link.includes('zoom.us'))
    return <Video className="h-3.5 w-3.5 text-blue-500" />;
  return <Link2 className="h-3.5 w-3.5 text-muted-foreground" />;
}

interface BotPillProps {
  status: string | null;
  clientId: string | null;
  eventId: string;
  isPro: boolean;
  hasClient: boolean;
}

function BotPill({
  status,
  clientId,
  eventId,
  isPro,
  hasClient,
}: BotPillProps) {
  const router = useRouter();

  const openUpload = () => {
    if (clientId) router.push(`/clients/${clientId}?upload=true`);
  };

  // Free coach with a matched client — show upgrade CTA
  if (!isPro && hasClient) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
        Pro feature
      </span>
    );
  }

  if (!status) return null;

  const s = status as RecallBotStatus;

  if (s === 'pending' || s === 'joining') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Bot joining…
      </span>
    );
  }

  if (s === 'in_meeting') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
        <Radio className="h-3 w-3" />
        Recording
      </span>
    );
  }

  if (s === 'done') {
    return (
      <button
        onClick={e => {
          e.stopPropagation();
          if (clientId) router.push(`/clients/${clientId}`);
        }}
        className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline"
      >
        <CheckCircle2 className="h-3 w-3" />
        Recorded
      </button>
    );
  }

  if (s === 'error') {
    return (
      <button
        onClick={e => {
          e.stopPropagation();
          openUpload();
        }}
        className="flex items-center gap-1 text-[11px] text-red-500 hover:underline"
      >
        <XCircle className="h-3 w-3" />
        Failed — Upload manually ›
      </button>
    );
  }

  if (s === 'quota_exceeded') {
    return (
      <button
        onClick={e => {
          e.stopPropagation();
          openUpload();
        }}
        className="flex items-center gap-1 text-[11px] text-orange-500 hover:underline"
      >
        <AlertCircle className="h-3 w-3" />
        Quota reached
      </button>
    );
  }

  if (s === 'skipped') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <SkipForward className="h-3 w-3" />
        Skipped
      </span>
    );
  }

  return null;
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

  const isConnected = Boolean(status?.connected);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchEvents,
    enabled: isConnected,
  });

  const sync = useMutation({
    mutationFn: triggerSync,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Calendar refreshed');
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    },
  });

  // Loading
  if (statusLoading || (isConnected && eventsLoading)) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Upcoming Sessions
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

  // Not connected
  if (!isConnected) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[15px] font-semibold text-foreground">
            Upcoming Sessions
          </h3>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground">
            Connect Google Calendar to see upcoming sessions.
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

  // Connected, no events
  if (events.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Upcoming Sessions
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
          No upcoming sessions in the next 24 hours.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[12px] border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold text-foreground">
              Upcoming Sessions
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

        <ul className="space-y-1.5">
          {events.map(evt => {
            const isMatched = Boolean(evt.client_id && evt.client_name);
            const label = isMatched ? evt.client_name : evt.title;

            return (
              <li
                key={evt.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-[8px] hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (isMatched) {
                    router.push(`/clients/${evt.client_id}`);
                  } else {
                    setMatchEvent(evt);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <PlatformIcon link={evt.meet_link} />
                  <span
                    className={`text-[13px] truncate ${
                      isMatched
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <BotPill
                    status={evt.bot_status}
                    clientId={evt.client_id}
                    eventId={evt.id}
                    isPro={isPro}
                    hasClient={isMatched}
                  />
                  <span className="text-[12px] text-muted-foreground font-mono">
                    {formatRelative(evt.start_time)}
                  </span>
                  {isMatched ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <span className="flex items-center gap-1 text-[12px] text-primary">
                      <Plus className="h-3 w-3" />
                      Match
                    </span>
                  )}
                </div>
              </li>
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
