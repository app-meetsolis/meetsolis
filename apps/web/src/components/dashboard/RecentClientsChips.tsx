'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Client } from '@meetsolis/shared';
import { initials } from './types';
import type { SessionWithClient, ActionItemWithClient } from './types';

interface Props {
  clients: Client[];
  sessions: SessionWithClient[];
  actions: ActionItemWithClient[];
}

function daysSince(date: string | Date | null | undefined): number {
  if (!date) return 999;
  try {
    return differenceInDays(new Date(), new Date(date));
  } catch {
    return 999;
  }
}

export function RecentClientsChips({ clients, sessions, actions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sorted = [...clients]
    .sort((a, b) => daysSince(a.last_session_at) - daysSince(b.last_session_at))
    .slice(0, 5);

  const allSorted = [...clients].sort(
    (a, b) => daysSince(a.last_session_at) - daysSince(b.last_session_at)
  );

  function clientActionCount(clientId: string) {
    return actions.filter(a => a.client_id === clientId).length;
  }

  function latestSession(clientId: string): SessionWithClient | undefined {
    return sessions.filter(s => s.client_id === clientId)[0];
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-card border border-border rounded-[12px] px-4 py-3">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em] mr-1 whitespace-nowrap">
          Clients
        </span>

        {sorted.map(client => {
          const days = daysSince(client.last_session_at);
          return (
            <button
              key={client.id}
              onClick={() => setOpen(true)}
              className="flex items-center gap-[7px] px-3 py-1.5 bg-muted border border-border rounded-full cursor-pointer transition-all text-[13px] hover:bg-accent hover:border-border"
            >
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="font-medium text-secondary-foreground">
                {client.name.split(' ')[0]}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {days < 999 ? `${days}d` : '—'}
              </span>
            </button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="ml-auto text-[12px] h-7 px-3 rounded-lg whitespace-nowrap"
        >
          All Clients →
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-[18px] pb-3.5 border-b border-border">
            <DialogTitle className="text-[15px]">Recent Clients</DialogTitle>
            <DialogDescription className="text-[12px]">
              Sorted by last session · click to jump
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[420px]">
            {allSorted.map(client => {
              const days = daysSince(client.last_session_at);
              const overdue = days >= 14;
              const actionCount = clientActionCount(client.id);
              const lastSess = latestSession(client.id);

              return (
                <div
                  key={client.id}
                  className="flex items-center gap-3.5 px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/clients/${client.id}`);
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-primary/20 text-primary">
                    {initials(client.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-foreground flex items-center gap-1.5">
                      {client.name}
                      {overdue && (
                        <span className="text-[11px] text-muted-foreground font-normal">
                          · needs attention
                        </span>
                      )}
                    </div>
                    {lastSess && (
                      <div className="text-[12px] text-muted-foreground mt-0.5 truncate">
                        &ldquo;{lastSess.title}&rdquo;
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {days < 999 ? `${days} days ago` : 'No sessions'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {actionCount > 0
                          ? `${actionCount} open action${actionCount !== 1 ? 's' : ''}`
                          : 'No open actions'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex gap-[7px] shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    {lastSess && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpen(false);
                          router.push(
                            `/clients/${client.id}/sessions/${lastSess.id}`
                          );
                        }}
                        className="h-7 px-3 text-[11.5px]"
                      >
                        View Session
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        router.push(`/clients/${client.id}`);
                      }}
                      className="h-7 px-3 text-[11.5px]"
                    >
                      {overdue ? 'Prepare with Solis' : 'Go to Client →'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
