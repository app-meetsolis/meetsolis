'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MoreHorizontal,
  Pencil,
  Sparkles,
  StickyNote,
  Target,
  Layers,
} from 'lucide-react';
import { Client, ClientActionItem, Session } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { ClientModal } from '@/components/clients/ClientModal';
import { SessionAccordion } from '@/components/sessions/SessionAccordion';
import { LiveTranscriptPanel } from '@/components/sessions/LiveTranscriptPanel';
import { ActionItemsAutoToggle } from '@/components/sessions/ActionItemsAutoToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SolisPanel } from '@/components/solis/SolisPanel';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [editOpen, setEditOpen] = useState(false);
  const [solisOpen, setSolisOpen] = useState(false);

  const isValid = UUID_REGEX.test(id);

  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useQuery<Client, Error>({
    queryKey: ['client', id],
    queryFn: async () => {
      const r = await fetch(`/api/clients/${id}`);
      if (r.status === 404) throw new Error('NOT_FOUND');
      if (!r.ok) throw new Error('FETCH_ERROR');
      return r.json();
    },
    enabled: isValid,
    staleTime: 2 * 60 * 1000,
  });

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const r = await fetch(`/api/sessions?client_id=${id}`);
      if (!r.ok) return [];
      return (await r.json()).sessions ?? [];
    },
    enabled: isValid && !!client,
    staleTime: 30_000,
  });

  const { data: allItems = [] } = useQuery<ClientActionItem[]>({
    queryKey: ['all-action-items', id],
    queryFn: async () => {
      const r = await fetch(`/api/action-items?client_id=${id}`);
      if (!r.ok) return [];
      return (await r.json()).actionItems ?? [];
    },
    enabled: isValid && !!client,
    staleTime: 60_000,
  });

  // Detect an in-progress (or just-ended) bot meeting for this client.
  const { data: liveSession } = useQuery<{ session_id: string | null }>({
    queryKey: ['live-session', id],
    queryFn: async () => {
      const r = await fetch(`/api/clients/${id}/live-session`);
      if (!r.ok) return { session_id: null };
      return r.json();
    },
    enabled: isValid && !!client,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  if (!isValid)
    return (
      <div className="px-7 py-8">
        <p className="text-red-400 text-[13px]">Invalid client ID.</p>
        <Button
          variant="ghost"
          onClick={() => router.push('/clients')}
          className="mt-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );

  if (isLoading)
    return (
      <div className="px-7 py-6 space-y-4">
        <div className="skeleton rounded-md h-4 w-24" />
        <div className="skeleton rounded-md h-32 w-full rounded-[16px]" />
        <div className="skeleton rounded-md h-10 w-72" />
        <div className="skeleton rounded-md h-6 w-40" />
        <div className="space-y-2">
          <div className="skeleton rounded-md h-14 w-full rounded-[14px]" />
          <div className="skeleton rounded-md h-14 w-full rounded-[14px]" />
          <div className="skeleton rounded-md h-14 w-full rounded-[14px]" />
        </div>
      </div>
    );

  if (isError || !client)
    return (
      <div className="px-7 py-8">
        <p className="text-foreground/45 text-[13px]">
          {error?.message === 'NOT_FOUND'
            ? 'Client not found.'
            : 'Failed to load.'}
        </p>
        <Button
          variant="ghost"
          onClick={() => router.push('/clients')}
          className="mt-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );

  const ini = initials(client.name);
  const coachingSince = client.start_date
    ? format(parseISO(client.start_date), 'MMM yyyy')
    : null;
  const lastSession = client.last_session_at
    ? format(new Date(client.last_session_at), 'MMM d, yyyy')
    : '—';
  const pendingCount = allItems.filter(i => !i.completed).length;
  const roleCompany =
    [client.role, client.company].filter(Boolean).join(' · ') || null;
  const sessionById = new Map(sessions.map(s => [s.id, s]));

  return (
    <>
      <Toaster position="top-right" duration={3000} />

      <div className="px-7 py-6 space-y-5">
        {/* -- Breadcrumb -- */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clients')}
          className="h-auto p-0 gap-1.5 text-[12px] text-foreground/35 hover:text-foreground/70 hover:bg-transparent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Clients
        </Button>

        {/* -- Profile card -- */}
        <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[18px] font-bold bg-primary/15 text-primary">
                {ini}
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-foreground leading-tight">
                  {client.name}
                </h1>
                {roleCompany && (
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-foreground/40">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span>{roleCompany}</span>
                  </div>
                )}
                {client.goal && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] text-primary">
                      <Target className="h-3 w-3 shrink-0" />
                      {client.goal}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-8 gap-1.5 text-[12px] border-border bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/30 hover:text-foreground/70"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-[12px]">
              <Layers className="h-3.5 w-3.5 text-foreground/30" />
              <span className="font-semibold text-foreground">
                {sessions.length}
              </span>
              <span className="text-foreground/35">total sessions</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-semibold text-foreground">
                {pendingCount}
              </span>
              <span className="text-foreground/35">pending actions</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <Calendar className="h-3.5 w-3.5 text-foreground/30" />
              <span className="text-foreground/35">Last session</span>
              <span className="font-semibold text-foreground">
                {lastSession}
              </span>
            </div>
            {coachingSince && (
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-foreground/35">Coaching since</span>
                <span className="font-semibold text-foreground">
                  {coachingSince}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* -- Action buttons -- */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSolisOpen(true)}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Ask Solis
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border-border bg-transparent px-4 py-2 text-[13px] font-medium gap-2"
          >
            <StickyNote className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* -- Live transcript (only while a bot meeting is active) -- */}
        {liveSession?.session_id && (
          <LiveTranscriptPanel sessionId={liveSession.session_id} />
        )}

        {/* -- 2-col body -- */}
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT — session history */}
          <div className="col-span-8">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-[15px] font-semibold text-foreground">
                Session History
              </h2>
              {sessions.length > 0 && (
                <span className="rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[11px] font-semibold text-foreground/50">
                  {sessions.length}
                </span>
              )}
            </div>
            <SessionAccordion
              sessions={sessions}
              actionItems={allItems}
              clientId={id}
            />
          </div>

          {/* RIGHT — open action items */}
          <div className="col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-semibold text-foreground">
                  Open Actions
                </h2>
                {allItems.filter(i => !i.completed).length > 0 && (
                  <span className="rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[11px] font-semibold text-foreground/50">
                    {allItems.filter(i => !i.completed).length}
                  </span>
                )}
              </div>
              <ActionItemsAutoToggle />
            </div>
            <div className="rounded-[12px] bg-card shadow-card overflow-hidden">
              {allItems.filter(i => !i.completed).length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-10">
                  <p className="text-[12px] text-foreground/30">
                    All caught up
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {allItems
                    .filter(i => !i.completed)
                    .slice(0, 8)
                    .map(item => {
                      const fromSession = item.session_id
                        ? sessionById.get(item.session_id)
                        : undefined;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 px-5 py-3.5"
                        >
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              {item.assignee && (
                                <span className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide bg-primary/10 text-primary">
                                  {item.assignee === 'coach'
                                    ? 'COACH'
                                    : 'CLIENT'}
                                </span>
                              )}
                              {fromSession && (
                                <span className="truncate text-[10px] text-foreground/35">
                                  {fromSession.title} ·{' '}
                                  {format(
                                    parseISO(fromSession.session_date),
                                    'MMM d'
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClientModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          queryClient.invalidateQueries({ queryKey: ['client', id] });
        }}
        mode="edit"
        client={client}
      />

      <Dialog open={solisOpen} onOpenChange={setSolisOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Ask Solis about {client.name}</DialogTitle>
            <DialogDescription className="sr-only">
              AI Q&A about {client.name}
            </DialogDescription>
          </DialogHeader>
          <SolisPanel clientId={id} clientName={client.name} />
        </DialogContent>
      </Dialog>
    </>
  );
}
