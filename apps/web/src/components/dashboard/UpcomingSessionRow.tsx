'use client';

/**
 * UpcomingSessionRow — extracted from UpcomingSessionsCard.
 * Renders a single calendar_event row with action buttons + dropdown menu.
 * Story 6.1 (match), Story 6.2 (bot pill), Story 6.5 (skip-bot + open-in-cal menu).
 */

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
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
  Mic,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import {
  format,
  formatDistanceToNowStrict,
  differenceInMinutes,
  isToday,
  isTomorrow,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  CalendarEventWithClient,
  RecallBotStatus,
} from '@meetsolis/shared';

async function dispatchNow(eventId: string): Promise<{ bot_id: string }> {
  const res = await fetch('/api/recall/dispatch-now', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.detail
      ? `${body.error}: ${body.detail}`
      : body.error || 'Failed to dispatch bot';
    throw new Error(msg);
  }
  return body;
}

async function patchEvent(
  eventId: string,
  patch: { bot_skipped?: boolean }
): Promise<void> {
  const res = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to update event');
  }
}

function formatRelative(startTime: string): string {
  const date = new Date(startTime);
  const minutes = differenceInMinutes(date, new Date());

  if (minutes < -60) {
    if (isToday(date)) return `today ${format(date, 'h:mm a')}`;
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
  if (minutes < 0) return `${Math.abs(minutes)} min ago`;
  if (minutes === 0) return 'starting now';
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

function JoinWithNotetakerButton({
  eventId,
  meetLink,
  isPro,
  hasClient,
  startTime,
  botStatus,
}: {
  eventId: string;
  meetLink: string | null;
  isPro: boolean;
  hasClient: boolean;
  startTime: string;
  botStatus: string | null;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => dispatchNow(eventId),
    onSuccess: async () => {
      toast.success('Notetaker dispatched');
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : 'Failed to dispatch');
    },
  });

  if (!isPro || !hasClient || !meetLink || botStatus) return null;

  const minutesToStart = differenceInMinutes(new Date(startTime), new Date());
  if (minutesToStart < -60 || minutesToStart > 60) return null;

  return (
    <Button
      size="sm"
      variant="default"
      disabled={mutation.isPending}
      onClick={e => {
        e.stopPropagation();
        // Open meet link SYNCHRONOUSLY — popup blockers require direct user gesture.
        if (meetLink) window.open(meetLink, '_blank', 'noopener,noreferrer');
        mutation.mutate();
      }}
      className="h-7 gap-1.5 text-[12px] px-2.5"
    >
      {mutation.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Mic className="h-3 w-3" />
      )}
      Join with Notetaker
    </Button>
  );
}

function BotPill({
  status,
  clientId,
  eventId,
  meetLink,
  isPro,
  hasClient,
}: {
  status: string | null;
  clientId: string | null;
  eventId: string;
  meetLink: string | null;
  isPro: boolean;
  hasClient: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: () => dispatchNow(eventId),
    onSuccess: async () => {
      toast.success('Notetaker dispatched');
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : 'Retry failed');
    },
  });

  const openUpload = () => {
    if (clientId) router.push(`/clients/${clientId}?upload=true`);
  };

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
      <div className="flex items-center gap-2">
        <button
          onClick={e => {
            e.stopPropagation();
            if (meetLink)
              window.open(meetLink, '_blank', 'noopener,noreferrer');
            retryMutation.mutate();
          }}
          disabled={retryMutation.isPending}
          className="flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
        >
          {retryMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Mic className="h-3 w-3" />
          )}
          Retry
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            openUpload();
          }}
          className="flex items-center gap-1 text-[11px] text-red-500 hover:underline"
        >
          <XCircle className="h-3 w-3" />
          Upload manually
        </button>
      </div>
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

function RowMenu({
  event,
  isPro,
  autoTranscribeEnabled,
  onMatch,
}: {
  event: CalendarEventWithClient;
  isPro: boolean;
  autoTranscribeEnabled: boolean;
  onMatch: () => void;
}) {
  const queryClient = useQueryClient();
  const isMatched = Boolean(event.client_id && event.client_name);

  const skipMutation = useMutation({
    mutationFn: (skip: boolean) => patchEvent(event.id, { bot_skipped: skip }),
    onSuccess: async (_data, skip) => {
      toast.success(skip ? 'Bot will skip this session' : 'Bot re-enabled');
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: err => {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    },
  });

  const showSkipItem =
    isPro && autoTranscribeEnabled && Boolean(event.meet_link);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={e => e.stopPropagation()}
        className="text-[13px]"
      >
        <DropdownMenuItem onClick={onMatch}>
          {isMatched ? 'Change client' : 'Match to client'}
        </DropdownMenuItem>
        {showSkipItem && (
          <DropdownMenuItem
            onClick={() => skipMutation.mutate(!event.bot_skipped)}
            disabled={skipMutation.isPending}
          >
            {event.bot_skipped ? 'Re-enable bot' : 'Skip bot for this session'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() =>
            window.open(
              'https://calendar.google.com/',
              '_blank',
              'noopener,noreferrer'
            )
          }
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          Open in Google Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RowProps {
  event: CalendarEventWithClient;
  isPro: boolean;
  autoTranscribeEnabled: boolean;
  isPast: boolean;
  onRowClick: () => void;
  onOpenMatch: () => void;
}

export function UpcomingSessionRow({
  event,
  isPro,
  autoTranscribeEnabled,
  isPast,
  onRowClick,
  onOpenMatch,
}: RowProps) {
  const isMatched = Boolean(event.client_id && event.client_name);
  const label = isMatched ? event.client_name : event.title;

  return (
    <li
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-[8px] hover:bg-muted/50 transition-colors cursor-pointer ${isPast ? 'opacity-70' : ''}`}
      onClick={onRowClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <PlatformIcon link={event.meet_link} />
        <span
          className={`text-[13px] truncate ${
            isMatched ? 'font-medium text-foreground' : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <JoinWithNotetakerButton
          eventId={event.id}
          meetLink={event.meet_link}
          isPro={isPro}
          hasClient={isMatched}
          startTime={event.start_time}
          botStatus={event.bot_status}
        />
        <BotPill
          status={event.bot_status}
          clientId={event.client_id}
          eventId={event.id}
          meetLink={event.meet_link}
          isPro={isPro}
          hasClient={isMatched}
        />
        <span className="text-[12px] text-muted-foreground font-mono">
          {formatRelative(event.start_time)}
        </span>
        {isMatched ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <span className="flex items-center gap-1 text-[12px] text-primary">
            <Plus className="h-3 w-3" />
            Match
          </span>
        )}
        <RowMenu
          event={event}
          isPro={isPro}
          autoTranscribeEnabled={autoTranscribeEnabled}
          onMatch={onOpenMatch}
        />
      </div>
    </li>
  );
}
