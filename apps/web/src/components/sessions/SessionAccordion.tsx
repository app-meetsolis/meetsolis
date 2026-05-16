'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Square,
  CheckSquare,
} from 'lucide-react';
import { Session, ClientActionItem } from '@meetsolis/shared';
import { SummaryView } from './SummaryView';
import { TranscriptModal } from './TranscriptModal';
import { GenerateActionItemsButton } from './GenerateActionItemsButton';

interface Props {
  sessions: Session[];
  actionItems: ClientActionItem[];
  clientId: string;
}

function StatusChip({ status }: { status: Session['status'] }) {
  const map = {
    complete: 'bg-primary/10 text-primary',
    processing: 'bg-muted text-muted-foreground',
    pending: 'bg-muted text-muted-foreground',
    error: 'bg-red-400/12 text-red-400',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? map.pending}`}
    >
      {status}
    </span>
  );
}

function AssigneeBadge({ assignee }: { assignee: string | null }) {
  if (!assignee) return null;
  const label = assignee === 'coach' ? 'COACH' : 'CLIENT';
  return (
    <span className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide bg-primary/10 text-primary">
      {label}
    </span>
  );
}

export function SessionAccordion({ sessions, actionItems, clientId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );
  const [openId, setOpenId] = useState<string | null>(sorted[0]?.id ?? null);
  const [transcriptSessionId, setTranscriptSessionId] = useState<string | null>(
    null
  );

  const refreshActionItems = () =>
    queryClient.invalidateQueries({
      queryKey: ['all-action-items', clientId],
    });

  if (sorted.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-card px-6 py-10 text-center">
        <p className="text-[13px] text-foreground/30">
          No sessions yet. Upload a transcript to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((session, idx) => {
        const isOpen = openId === session.id;
        const sessionItems = actionItems.filter(
          i => i.session_id === session.id
        );
        const pending = sessionItems.filter(i => !i.completed).length;
        const completed = sessionItems.filter(i => i.completed).length;
        const isFirst = idx === 0;
        const dateObj = parseISO(session.session_date);

        return (
          <div
            key={session.id}
            className="rounded-[12px] border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : session.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="shrink-0 w-16 text-left">
                <p className="text-[13px] font-semibold text-foreground/70">
                  {format(dateObj, 'MMM d')}
                </p>
                <p className="text-[10px] text-foreground/25">
                  {format(parseISO(session.created_at), 'h:mm a')}
                </p>
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="truncate text-[14px] font-semibold text-foreground">
                  {session.title}
                </p>
                {isFirst && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Most Recent
                  </span>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <StatusChip status={session.status} />
                {pending > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {pending} pending
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-foreground/30" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-foreground/30" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border px-6 py-5 space-y-5">
                <SummaryView sessionId={session.id} />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
                      Action Items
                    </p>
                    {sessionItems.length > 0 && (
                      <p className="text-[10px] text-foreground/25">
                        {completed} / {sessionItems.length} complete
                      </p>
                    )}
                  </div>
                  {sessionItems.length > 0 ? (
                    <div className="space-y-2">
                      {sessionItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 py-1"
                        >
                          {item.completed ? (
                            <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 shrink-0 text-foreground/25" />
                          )}
                          <p
                            className={`flex-1 text-[13px] ${item.completed ? 'line-through text-foreground/25' : 'text-foreground/75'}`}
                          >
                            {item.description}
                          </p>
                          <AssigneeBadge assignee={item.assignee} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-foreground/30">
                      No action items for this session yet.
                    </p>
                  )}
                  <div className="mt-3">
                    <GenerateActionItemsButton
                      sessionId={session.id}
                      sessionStatus={session.status}
                      onGenerated={refreshActionItems}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1 border-t border-border">
                  <button
                    onClick={() => setTranscriptSessionId(session.id)}
                    className="flex items-center gap-1.5 text-[12px] text-foreground/40 hover:text-foreground/80 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Transcript
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/clients/${clientId}/sessions/${session.id}`)
                    }
                    className="flex items-center gap-1.5 text-[12px] text-foreground/40 hover:text-foreground/80 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Summary
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {transcriptSessionId && (
        <TranscriptModal
          sessionId={transcriptSessionId}
          open
          onOpenChange={o => {
            if (!o) setTranscriptSessionId(null);
          }}
        />
      )}
    </div>
  );
}
