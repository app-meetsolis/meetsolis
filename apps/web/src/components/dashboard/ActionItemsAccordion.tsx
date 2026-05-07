'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { SessionWithClient, ActionItemWithClient } from './types';

interface Props {
  actions: ActionItemWithClient[];
  sessions: SessionWithClient[];
}

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ActionItemsAccordion({ actions, sessions }: Props) {
  const queryClient = useQueryClient();
  const [completing, setCompleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Track which clients are CLOSED (all open by default, even as data loads)
  const [closedClients, setClosedClients] = useState<Set<string>>(new Set());

  const grouped = actions.reduce<Record<string, ActionItemWithClient[]>>(
    (acc, item) => {
      if (!acc[item.client_id]) acc[item.client_id] = [];
      acc[item.client_id].push(item);
      return acc;
    },
    {}
  );

  const clientIds = Object.keys(grouped);

  const toggleClient = (id: string) =>
    setClosedClients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const markComplete = async () => {
    if (selected.size === 0 || completing) return;
    setCompleting(true);
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          fetch(`/api/action-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'completed',
              completed: true,
              completed_at: new Date().toISOString(),
            }),
          })
        )
      );
    } finally {
      setCompleting(false);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['dash-actions'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-action-count'] });
    }
  };

  if (clientIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <p className="text-[13px] text-muted-foreground">All caught up</p>
      </div>
    );
  }

  const totalOverdue = actions.filter(
    i => i.due_date && new Date(i.due_date) < new Date()
  ).length;

  return (
    <div className="rounded-xl shadow-sunken bg-muted/50 p-2 space-y-1.5">
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[12px] font-medium text-foreground">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            onClick={markComplete}
            disabled={completing}
            className="h-7 px-3 text-[12px]"
          >
            {completing ? 'Marking…' : 'Mark Complete'}
          </Button>
        </div>
      )}

      {clientIds.map(clientId => {
        const items = grouped[clientId];
        const clientName = items[0].client_name;
        const isOpen = !closedClients.has(clientId);
        const overdueCount = items.filter(
          i => i.due_date && new Date(i.due_date) < new Date()
        ).length;

        // Compute last session from sessions prop (more reliable than last_session_at)
        const clientSessions = sessions.filter(s => s.client_id === clientId);
        const daysSince = clientSessions[0]?.session_date
          ? differenceInDays(
              new Date(),
              new Date(clientSessions[0].session_date)
            )
          : null;

        return (
          <div
            key={clientId}
            className="rounded-[10px] bg-card overflow-hidden"
          >
            {/* Client header */}
            <button
              onClick={() => toggleClient(clientId)}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[13px] font-bold text-primary shrink-0">
                {initials(clientName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground leading-[1.2]">
                  {clientName}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {daysSince !== null
                    ? `Last session ${daysSince}d ago`
                    : 'No sessions yet'}
                  {overdueCount > 0 && (
                    <span className="text-red-400 ml-1.5">
                      · {overdueCount} overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold flex items-center justify-center">
                  {items.length}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Action items */}
            {isOpen && (
              <div className="px-3.5 pb-3">
                {items.map((item, idx) => {
                  const sel = selected.has(item.id);
                  const overdue =
                    item.due_date && new Date(item.due_date) < new Date();
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-2.5 py-2.5 transition-opacity',
                        idx < items.length - 1 ? 'border-b border-border' : '',
                        sel ? 'opacity-40' : 'opacity-100'
                      )}
                    >
                      <Checkbox
                        checked={sel}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-[2px] shrink-0 h-3.5 w-3.5"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[12.5px] leading-[1.5] text-muted-foreground block">
                          {item.description}
                        </span>
                        {overdue && (
                          <span className="text-[10px] text-red-400 font-medium mt-0.5 block">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary footer */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/60">
        <span className="text-[11px] text-muted-foreground">
          {actions.length} action{actions.length !== 1 ? 's' : ''} ·{' '}
          {clientIds.length} client{clientIds.length !== 1 ? 's' : ''}
        </span>
        {totalOverdue > 0 ? (
          <span className="text-[11px] font-medium text-red-400">
            {totalOverdue} overdue
          </span>
        ) : (
          <span className="text-[11px] font-medium text-primary">
            All on track
          </span>
        )}
      </div>
    </div>
  );
}
