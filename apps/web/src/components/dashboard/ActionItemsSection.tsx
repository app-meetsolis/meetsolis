'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Calendar, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { ActionItemWithClient } from './types';

interface Props {
  actions: ActionItemWithClient[];
  attentionClient?: { name: string; daysSince: number };
  pendingUploadClient?: string;
  nextSessionClient?: string;
}

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  try {
    return new Date(dueDate) < new Date();
  } catch {
    return false;
  }
}

export function ActionItemsSection({
  actions,
  attentionClient,
  pendingUploadClient,
  nextSessionClient,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  const grouped = actions.reduce<Record<string, ActionItemWithClient[]>>(
    (acc, item) => {
      const key = item.client_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const toggleItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const markComplete = async () => {
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
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
          Open Actions
        </span>
        <span className="text-[13px] text-muted-foreground font-mono">
          {actions.length} items
        </span>
      </div>

      {actions.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-10">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <p className="text-[13px] text-muted-foreground">All caught up</p>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([clientId, items]) => {
            const clientName = items[0].client_name;
            const hasOverdue = items.some(i => isOverdue(i.due_date));
            return (
              <div key={clientId} className="mb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {clientName}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {items.length}
                    {hasOverdue ? ' · overdue' : ''}
                  </span>
                </div>
                {items.map(item => {
                  const sel = selected.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-[9px] py-2.5 border-b border-border last:border-b-0"
                      style={{ opacity: sel ? 0.5 : 1 }}
                    >
                      <Checkbox
                        checked={sel}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-[2px] shrink-0"
                      />
                      <span className="text-[13px] leading-[1.5] flex-1 text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {selected.size > 0 && (
            <div className="sticky bottom-4 flex items-center gap-3 bg-card border border-border rounded-[12px] px-4 py-2.5 mt-3 shadow-lg">
              <span className="text-[13px] font-medium text-secondary-foreground">
                {selected.size} selected
              </span>
              <Button
                size="sm"
                onClick={markComplete}
                disabled={completing}
                className="h-[30px] px-3.5 text-[12.5px]"
              >
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(new Set())}
                className="h-[30px] px-3.5 text-[12.5px]"
              >
                Cancel
              </Button>
            </div>
          )}
        </>
      )}

      <Separator className="my-5" />

      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] mb-3">
          Recommended
        </div>

        {attentionClient && (
          <div className="flex items-start gap-3 py-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted text-primary">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground leading-[1.45]">
                Schedule a catch-up with {attentionClient.name} — longest gap in
                portfolio
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {attentionClient.daysSince} days ·{' '}
                {actions.filter(
                  a =>
                    a.client_name === attentionClient.name &&
                    isOverdue(a.due_date)
                ).length > 0
                  ? 'overdue action still open'
                  : 'no open actions'}
              </div>
            </div>
          </div>
        )}

        {pendingUploadClient && (
          <div className="flex items-start gap-3 py-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted text-primary">
              <Upload className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground leading-[1.45]">
                Upload {pendingUploadClient}&apos;s transcript
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Session logged · no transcript yet
              </div>
            </div>
          </div>
        )}

        {nextSessionClient && (
          <div className="flex items-start gap-3 py-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div
                className="text-[13px] text-muted-foreground leading-[1.45] cursor-pointer hover:text-primary transition-colors"
                onClick={() =>
                  router.push(
                    `/intelligence?q=${encodeURIComponent(`Prepare me for my next coaching session with ${nextSessionClient}. What should I focus on?`)}`
                  )
                }
              >
                Prep {nextSessionClient}&apos;s next session with Solis
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Explore progress before next meeting
              </div>
            </div>
          </div>
        )}

        {!attentionClient && !pendingUploadClient && !nextSessionClient && (
          <div className="text-[13px] text-muted-foreground py-2">
            No recommendations right now.
          </div>
        )}
      </div>
    </div>
  );
}
