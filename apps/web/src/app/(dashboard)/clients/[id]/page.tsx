/**
 * Story 7.7 — Living Client Card page (orchestrator).
 *
 * Vertical 5-section LinkedIn-style profile:
 *   1. Header (avatar, identity, stats, goal)
 *   2. Open Action Items slot (Story 7.6 will own; placeholder for now)
 *   3. AI Intelligence Strip (Story 7.2)
 *   4. Session Feed
 *   5. ABOUT
 *
 * This file is intentionally thin — heavy lifting lives in client/* components.
 */

'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, MoreHorizontal, Sparkles } from 'lucide-react';
import { Toaster } from 'sonner';
import type {
  Client,
  ClientActionItem,
  Session,
  CalendarEvent,
} from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { ClientModal } from '@/components/clients/ClientModal';
import { ClientHeader } from '@/components/client/ClientHeader';
import { AIIntelligenceStrip } from '@/components/client/AIIntelligenceStrip';
import { ClientCardActionItemsSection } from '@/components/client/ClientCardActionItemsSection';
import { SessionFeed } from '@/components/client/SessionFeed';
import { AboutSection } from '@/components/client/AboutSection';
import { LiveTranscriptPanel } from '@/components/sessions/LiveTranscriptPanel';
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

  // Story 7.7 — next upcoming calendar event matched to this client.
  const { data: nextEvent } = useQuery<CalendarEvent | null>({
    queryKey: ['next-event', id],
    queryFn: async () => {
      const r = await fetch(
        `/api/calendar/events?client_id=${id}&upcoming=true&limit=1`
      );
      if (!r.ok) return null;
      const events = (await r.json()).events ?? [];
      return events[0] ?? null;
    },
    enabled: isValid && !!client,
    staleTime: 5 * 60 * 1000,
  });

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

  const sessionById = useMemo(
    () => new Map(sessions.map(s => [s.id, s])),
    [sessions]
  );

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

  return (
    <>
      <Toaster position="top-right" duration={3000} />
      <div className="px-7 py-6 space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/clients')}
            className="h-auto p-0 gap-1.5 text-[12px] text-foreground/35 hover:text-foreground/70 hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All clients
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSolisOpen(true)}
              className="h-8 gap-1.5 text-[12px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask Solis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/brief/manual/${id}`)}
              className="h-8 gap-1.5 text-[12px]"
            >
              <FileText className="h-3.5 w-3.5" />
              Coach Brief
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              className="h-8 w-8 text-foreground/30 hover:text-foreground/70"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 1. Header */}
        <ClientHeader
          client={client}
          sessionCount={sessions.length}
          nextSessionAt={nextEvent?.start_time ?? null}
        />

        {/* 2. Open Action Items (Story 7.6) */}
        <ClientCardActionItemsSection
          clientId={id}
          actionItems={allItems}
          sessionById={sessionById}
        />

        {/* 3. AI Intelligence Strip (Story 7.2) */}
        <AIIntelligenceStrip
          clientId={id}
          strip={client.ai_intelligence_strip ?? null}
          coachNotes={client.coach_notes ?? ''}
          hasSessions={sessions.length > 0}
          overrides={client.ai_intelligence_strip_overrides ?? {}}
        />

        {liveSession?.session_id && (
          <LiveTranscriptPanel sessionId={liveSession.session_id} />
        )}

        {/* 4. Session Feed */}
        <SessionFeed sessions={sessions} actionItems={allItems} clientId={id} />

        {/* 5. ABOUT */}
        <AboutSection client={client} />
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
              AI Q&amp;A about {client.name}
            </DialogDescription>
          </DialogHeader>
          <SolisPanel clientId={id} clientName={client.name} />
        </DialogContent>
      </Dialog>
    </>
  );
}
