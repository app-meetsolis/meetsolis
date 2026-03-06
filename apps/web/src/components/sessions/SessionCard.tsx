'use client';

import { useState } from 'react';
import { Session } from '@meetsolis/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Sparkles, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ActionItemList } from './ActionItemList';

interface SessionCardProps {
  session: Session & {
    action_items?: Array<{
      id: string;
      text: string;
      completed: boolean;
      session_id: string;
      client_id: string;
      user_id: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  onSummarize?: (sessionId: string) => void;
  isSummarizing?: boolean;
}

export function SessionCard({
  session,
  onSummarize,
  isSummarizing,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = (() => {
    try {
      return format(parseISO(session.session_date), 'MMMM d, yyyy');
    } catch {
      return session.session_date;
    }
  })();

  const pendingCount =
    session.action_items?.filter(a => !a.completed).length || 0;

  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
      {/* Session Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8E4DD]">
            <Calendar className="h-4 w-4 text-[#6B7280]" />
          </div>
          <div>
            <h4 className="font-medium text-[#1A1A1A]">
              {session.title || `Session — ${formattedDate}`}
            </h4>
            <p className="text-xs text-[#6B7280]">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.status === 'complete' && (
            <Badge
              variant="secondary"
              className="bg-green-50 text-green-700 text-[11px]"
            >
              Summarized
            </Badge>
          )}
          {session.status === 'processing' && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 text-[11px]"
            >
              Processing...
            </Badge>
          )}
          {session.status === 'error' && (
            <Badge
              variant="secondary"
              className="bg-red-50 text-red-700 text-[11px]"
            >
              Error
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-700 text-[11px]"
            >
              {pendingCount} pending
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Summary */}
          {session.summary ? (
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Summary
              </h5>
              <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">
                {session.summary}
              </p>
            </div>
          ) : session.status === 'pending' && session.transcript_text ? (
            <div className="flex items-center justify-between rounded-md bg-[#E8E4DD] p-3">
              <p className="text-sm text-[#6B7280]">
                Transcript ready — generate AI summary
              </p>
              <Button
                size="sm"
                className="gap-1.5 bg-[#001F3F] hover:bg-[#003366]"
                onClick={() => onSummarize?.(session.id)}
                disabled={isSummarizing}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isSummarizing ? 'Summarizing...' : 'Summarize'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">No summary yet.</p>
          )}

          {/* Key Topics */}
          {session.key_topics && session.key_topics.length > 0 && (
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Key Topics
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {session.key_topics.map(topic => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-[11px]"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {session.action_items && session.action_items.length > 0 && (
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Action Items
              </h5>
              <ActionItemList
                items={session.action_items}
                sessionId={session.id}
                clientId={session.client_id}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
