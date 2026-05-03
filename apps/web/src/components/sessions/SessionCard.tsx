'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Session } from '@meetsolis/shared';
import { ActionItemList } from '@/components/sessions/ActionItemList';

interface SessionCardProps {
  session: Session;
  clientId: string;
  onRetry: (id: string) => void;
}

function ActionCountBadge({
  actionItems,
}: {
  actionItems: { id: string; status: string }[];
}) {
  if (!actionItems.length) return null;
  const allComplete = actionItems.every(a => a.status === 'completed');
  const cls = allComplete
    ? 'bg-green-100 text-green-700'
    : 'bg-amber-100 text-amber-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {actionItems.length} action{actionItems.length !== 1 ? 's' : ''}
    </span>
  );
}

export function SessionCard({ session, clientId, onRetry }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = format(parseISO(session.session_date), 'MMM d, yyyy');
  const actionItems = session.action_items ?? [];
  const hasTranscript = !!(
    session.transcript_text || session.transcript_file_url
  );

  if (session.status === 'processing') {
    return (
      <div className="rounded-[12px] border border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {session.title}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {session.transcript_audio_url && !session.transcript_text
            ? 'Transcribing audio…'
            : 'AI is processing your session…'}
        </p>
      </div>
    );
  }

  if (session.status === 'error') {
    return (
      <div className="rounded-[12px] border border-red-400/20 bg-card px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {session.title}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            <p className="mt-1 text-xs text-red-600">
              AI processing failed. Please retry.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-red-400/20 text-red-500 hover:bg-red-500/10"
            onClick={() => onRetry(session.id)}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Normal (complete / pending)
  const visibleTopics = session.key_topics?.slice(0, 3) ?? [];
  const extraTopics = (session.key_topics?.length ?? 0) - 3;

  return (
    <div className="rounded-[12px] border border-border bg-card">
      {/* Header — clickable to toggle */}
      <button
        className="w-full px-4 py-4 text-left text-foreground"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
              {!!actionItems.length && (
                <ActionCountBadge actionItems={actionItems} />
              )}
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {session.title}
            </p>
            {!isExpanded && session.summary && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {session.summary.slice(0, 150)}
              </p>
            )}
            {!isExpanded && visibleTopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {visibleTopics.map(topic => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {extraTopics > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{extraTopics} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <span className="mt-0.5 shrink-0 text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {session.summary && (
            <p className="text-sm text-foreground">{session.summary}</p>
          )}

          {(session.key_topics?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {session.key_topics.map(topic => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <ActionItemList sessionId={session.id} clientId={clientId} />

          {hasTranscript && (
            <Link
              href={`/clients/${clientId}/sessions/${session.id}`}
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              View Full Transcript →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
