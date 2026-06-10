/**
 * Story 7.7 — Session Feed Row.
 *
 * Layout per row (collapsed):
 *   {date} · {AI session title} · {2-line summary preview} · {action count} · {tag pills}
 *
 * Click row to expand inline with full summary + action items (Q5 locked:
 * single row open at a time — controlled by parent).
 *
 * Tag pills are inline-editable via SessionTagPill / AddTagButton; mutation
 * hits PATCH /api/sessions/[id]/tags.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { ClientActionItem, Session, SessionTag } from '@meetsolis/shared';
import { AddTagButton, SessionTagPill } from './SessionTagPill';

interface Props {
  session: Session;
  actionItems: ClientActionItem[];
  isOpen: boolean;
  onToggle: () => void;
  clientId: string;
}

interface TagsPatch {
  tags: SessionTag[];
}

export function SessionFeedRow({
  session,
  actionItems,
  isOpen,
  onToggle,
  clientId,
}: Props) {
  const queryClient = useQueryClient();

  const tags = (session.tags ?? []) as SessionTag[];
  const sessionActionItems = actionItems.filter(
    a => a.session_id === session.id
  );
  const pendingCount = sessionActionItems.filter(a => !a.completed).length;

  const tagsMutation = useMutation({
    mutationFn: async (patch: TagsPatch) => {
      const r = await fetch(`/api/sessions/${session.id}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Save failed');
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setTags = (next: SessionTag[]) => tagsMutation.mutate({ tags: next });

  return (
    <div className="rounded-[12px] bg-card shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-5 py-4 hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="text-[11px] uppercase tracking-wider text-foreground/40 w-20 shrink-0 mt-0.5">
            {format(parseISO(session.session_date), 'MMM d')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight">
                {session.title}
              </h3>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <ListChecks className="h-2.5 w-2.5" />
                  {pendingCount}
                </span>
              )}
            </div>
            {session.summary && !isOpen && (
              <p className="mt-1 text-[12px] text-foreground/55 line-clamp-2 leading-relaxed">
                {session.summary}
              </p>
            )}
          </div>
          <div className="shrink-0 mt-1">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-foreground/30" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/30" />
            )}
          </div>
        </div>
      </button>

      {/* Tag bar — always visible (not hidden by collapse, so coach can tag at a glance) */}
      <div className="px-5 pb-3 -mt-1 flex items-center gap-1.5 flex-wrap">
        {tags.map(tag => (
          <SessionTagPill
            key={tag}
            tag={tag}
            onRemove={() => setTags(tags.filter(t => t !== tag))}
            onChange={next =>
              setTags(
                Array.from(new Set([...tags.filter(t => t !== tag), next]))
              )
            }
          />
        ))}
        {tags.length < 2 && (
          <AddTagButton
            existing={tags}
            onAdd={t =>
              setTags(
                Array.from(new Set([...tags, t])).slice(0, 2) as SessionTag[]
              )
            }
          />
        )}
      </div>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-border space-y-3">
          {session.summary && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-foreground/40 mb-1 mt-3">
                Summary
              </div>
              <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-line">
                {session.summary}
              </p>
            </div>
          )}
          {sessionActionItems.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
                Action items
              </div>
              <ul className="space-y-1.5">
                {sessionActionItems.map(item => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-[12px] text-foreground/75"
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.completed ? 'bg-foreground/20' : 'bg-primary'
                      }`}
                    />
                    <span
                      className={
                        item.completed ? 'line-through opacity-60' : ''
                      }
                    >
                      {item.description}
                    </span>
                    {item.assignee && (
                      <span className="ml-auto inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide bg-primary/10 text-primary">
                        {item.assignee === 'coach' ? 'COACH' : 'CLIENT'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href={`/clients/${clientId}/sessions/${session.id}`}
            className="inline-block text-[11px] text-primary/80 hover:text-primary hover:underline"
          >
            View full session →
          </Link>
        </div>
      )}
    </div>
  );
}
