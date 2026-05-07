'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, parseISO } from 'date-fns';
import { CheckCircle2, Clock, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { SessionWithClient } from './types';

interface Props {
  sessions: SessionWithClient[];
}

export function SessionsList({ sessions }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const recent = sessions.slice(0, 5);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const visible = recent.filter(s => !deletedIds.has(s.id));

  if (visible.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <p className="text-[13px] text-muted-foreground">
          No sessions yet — upload your first transcript
        </p>
      </div>
    );
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    if (selectedIds.size === 0 || isDeleting) return;
    setIsDeleting(true);
    const ids = Array.from(selectedIds);

    // Optimistic remove
    setDeletedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
    setSelectedIds(new Set());

    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/sessions/${id}`, { method: 'DELETE' }).then(r => {
            if (!r.ok) throw new Error(`Failed to delete session ${id}`);
          })
        )
      );
      toast.success(
        `${ids.length} session${ids.length > 1 ? 's' : ''} deleted`
      );
      queryClient.invalidateQueries({ queryKey: ['dash-sessions'] });
    } catch {
      // Rollback
      setDeletedIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      toast.error('Failed to delete sessions. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-xl shadow-sunken bg-muted/50 p-2">
      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-3 py-2 mb-1 rounded-lg bg-accent animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[12px] font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteSelected}
            disabled={isDeleting}
            className="h-7 px-2 text-[12px] text-red-500 hover:text-red-500 hover:bg-red-500/10 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {visible.map(session => {
          const daysSince = session.session_date
            ? differenceInDays(new Date(), parseISO(session.session_date))
            : null;
          const overdue = daysSince !== null && daysSince >= 14;
          const dateStr = session.session_date
            ? format(parseISO(session.session_date), 'MMM d')
            : '—';
          const excerpt = session.summary ? session.summary.slice(0, 140) : '';
          const prepareQuery = encodeURIComponent(
            `Prepare me for my next coaching session with ${session.client_name}. What should I focus on based on their history?`
          );
          const isSelected = selectedIds.has(session.id);

          return (
            <Card
              key={session.id}
              onClick={() =>
                router.push(
                  `/clients/${session.client_id}/sessions/${session.id}`
                )
              }
              className={`rounded-[10px] cursor-pointer border-0 shadow-none transition-colors ${isSelected ? 'bg-accent/80' : 'hover:bg-accent/60'}`}
            >
              <CardContent className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div
                    className="pt-[3px] shrink-0"
                    onClick={e => toggleSelect(session.id, e)}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="h-3.5 w-3.5 pointer-events-none"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                      <span className="text-[12px] font-semibold text-primary">
                        {session.client_name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        · {dateStr}
                      </span>
                      {overdue && daysSince !== null && (
                        <span className="ml-auto font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysSince}d ago
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] font-medium text-foreground mb-1.5 leading-[1.4]">
                      {session.title}
                    </div>
                    {excerpt && (
                      <div className="text-[12px] text-muted-foreground leading-[1.5] mb-2 line-clamp-2">
                        {excerpt}
                      </div>
                    )}
                    <div
                      className="flex items-center justify-between"
                      onClick={e => e.stopPropagation()}
                    >
                      <Badge
                        variant="outline"
                        className="gap-1 text-[11px] rounded-md"
                      >
                        <CheckCircle2 className="h-[11px] w-[11px]" />
                        <span>
                          {session.status === 'complete'
                            ? 'Complete'
                            : session.status}
                        </span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/intelligence?q=${prepareQuery}`)
                        }
                        className="text-[11px] font-medium px-2 py-1 h-auto rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Prepare with Solis{' '}
                        <Sparkles className="inline h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
