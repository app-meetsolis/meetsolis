'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, getDisplayName } from '@/hooks/useUserProfile';
import { useQuery } from '@tanstack/react-query';
import {
  Client,
  Session,
  ClientActionItem,
  type UsageResponse,
} from '@meetsolis/shared';
import { differenceInDays } from 'date-fns';
import { Upload, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { StatCards } from '@/components/dashboard/StatCards';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { SessionsList } from '@/components/dashboard/SessionsList';
import { ActionItemsAccordion } from '@/components/dashboard/ActionItemsAccordion';
import { SolisFab } from '@/components/dashboard/SolisFab';
import { UpcomingSessionsCard } from '@/components/dashboard/UpcomingSessionsCard';
import type {
  SessionWithClient,
  ActionItemWithClient,
} from '@/components/dashboard/types';

async function fetchClients(): Promise<Client[]> {
  const r = await fetch('/api/clients');
  if (!r.ok) return [];
  return (await r.json()).clients ?? [];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: usage } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: () => fetch('/api/usage').then(r => r.json()),
    staleTime: 60_000,
  });

  const ids = clients.map(c => c.id);

  const { data: sessions = [] } = useQuery<SessionWithClient[]>({
    queryKey: ['dash-sessions', ids],
    queryFn: async () => {
      const rows = await Promise.all(
        clients.map(async c => {
          const r = await fetch(`/api/sessions?client_id=${c.id}`);
          if (!r.ok) return [];
          return ((await r.json()).sessions ?? []).map((s: Session) => ({
            ...s,
            client_name: c.name,
          }));
        })
      );
      return rows
        .flat()
        .sort(
          (a, b) =>
            new Date(b.session_date).getTime() -
            new Date(a.session_date).getTime()
        );
    },
    enabled: ids.length > 0,
  });

  const { data: actions = [] } = useQuery<ActionItemWithClient[]>({
    queryKey: ['dash-actions', ids],
    queryFn: async () => {
      const rows = await Promise.all(
        clients.map(async c => {
          const r = await fetch(
            `/api/action-items?client_id=${c.id}&status=pending`
          );
          if (!r.ok) return [];
          return ((await r.json()).actionItems ?? []).map(
            (i: ClientActionItem) => ({
              ...i,
              client_name: c.name,
            })
          );
        })
      );
      return rows.flat();
    },
    enabled: ids.length > 0,
  });

  const firstName = getDisplayName(profile).split(' ')[0];

  const attentionClient = [...clients]
    .filter(
      c =>
        !c.last_session_at ||
        differenceInDays(new Date(), new Date(c.last_session_at)) >= 14
    )
    .map(c => ({
      name: c.name,
      daysSince: c.last_session_at
        ? differenceInDays(new Date(), new Date(c.last_session_at))
        : 999,
    }))
    .sort((a, b) => b.daysSince - a.daysSince)[0];

  if (authLoading || profileLoading || clientsLoading) {
    return (
      <div className="bg-background min-h-full">
        <div className="h-[54px] bg-card border-b border-border" />
        <div className="px-6 py-[22px] space-y-[18px]">
          <div className="skeleton rounded-[12px] h-[60px]" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton rounded-[12px] h-[140px]" />
            ))}
          </div>
          <div className="skeleton rounded-[12px] h-[260px]" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton rounded-[12px] h-[130px]" />
              ))}
            </div>
            <div className="skeleton rounded-[12px] h-[380px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full text-foreground">
      <DashboardTopbar usage={usage} />

      <div className="px-6 py-[22px] pb-10 space-y-[18px]">
        {/* Inline greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">
              {greeting()}, {firstName}.
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {sessions.length > 0
                ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} · ${actions.length} open action${actions.length !== 1 ? 's' : ''}`
                : 'No sessions yet — upload your first transcript'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/clients')}
              className="h-8 px-4 gap-1.5 text-[13px]"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Session
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/intelligence')}
              className="h-8 px-4 gap-1.5 text-[13px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask Solis
            </Button>
          </div>
        </div>

        {/* Upcoming Sessions — Story 6.1 */}
        <UpcomingSessionsCard />

        {/* 3 stat cards */}
        <StatCards
          clients={clients}
          actions={actions}
          attentionClient={attentionClient}
          sessions={sessions}
        />

        {/* Full-width trend chart */}
        <TrendsChart sessions={sessions} />

        {/* 50/50 bottom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
                Recent Sessions
              </span>
              <span className="text-[13px] text-muted-foreground font-mono">
                {sessions.length} total
              </span>
            </div>
            <SessionsList sessions={sessions} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
                Open Actions
              </span>
              <span className="text-[13px] text-muted-foreground font-mono">
                {actions.length} items
              </span>
            </div>
            <ActionItemsAccordion actions={actions} sessions={sessions} />
          </div>
        </div>
      </div>

      <SolisFab />
    </div>
  );
}
