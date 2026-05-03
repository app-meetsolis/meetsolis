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
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { GreetingCard } from '@/components/dashboard/GreetingCard';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { RecentClientsChips } from '@/components/dashboard/RecentClientsChips';
import { SessionsList } from '@/components/dashboard/SessionsList';
import { ActionItemsSection } from '@/components/dashboard/ActionItemsSection';
import { SolisFab } from '@/components/dashboard/SolisFab';
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
  const { isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  const { data: usage } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: () => fetch('/api/usage').then(r => r.json()),
    staleTime: 60_000,
  });

  const ids = clients?.map(c => c.id) ?? [];

  const { data: sessions = [] } = useQuery<SessionWithClient[]>({
    queryKey: ['dash-sessions', ids],
    queryFn: async () => {
      const rows = await Promise.all(
        (clients ?? []).map(async c => {
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
        (clients ?? []).map(async c => {
          const r = await fetch(
            `/api/action-items?client_id=${c.id}&status=pending`
          );
          if (!r.ok) return [];
          return ((await r.json()).actionItems ?? []).map(
            (i: ClientActionItem) => ({ ...i, client_name: c.name })
          );
        })
      );
      return rows.flat();
    },
    enabled: ids.length > 0,
  });

  const firstName = getDisplayName(profile).split(' ')[0];

  // Derive attention client (longest gap ≥14 days)
  const attentionCandidates = (clients ?? [])
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
    .sort((a, b) => b.daysSince - a.daysSince);
  const attentionClient = attentionCandidates[0];

  // Derive pending uploads
  const pendingUploadSessions = sessions.filter(
    s => !s.transcript_text && !s.transcript_file_url
  );
  const pendingUploads = pendingUploadSessions.length;
  const pendingUploadClient = pendingUploadSessions[0]?.client_name;

  // Next session client (most recent session client for prep recommendation)
  const nextSessionClient = sessions[0]?.client_name;

  // Action item counts for greeting
  const uniqueActionClients = new Set(actions.map(a => a.client_id)).size;

  if (authLoading || profileLoading || clientsLoading) {
    return (
      <div className="bg-background min-h-full">
        <div className="h-[54px] bg-card border-b border-border" />
        <div className="px-6 py-[22px] space-y-[18px]">
          <div className="skeleton rounded-[12px] h-[80px]" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton rounded-[12px] h-[110px]" />
            ))}
          </div>
          <div className="skeleton rounded-[12px] h-[56px]" />
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: '58fr 42fr' }}
          >
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton rounded-[12px] h-[130px]" />
              ))}
            </div>
            <div className="skeleton rounded-[12px] h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full text-foreground">
      <DashboardTopbar usage={usage} />

      <div className="px-6 py-[22px] pb-10 space-y-[18px]">
        <GreetingCard
          greeting={greeting()}
          firstName={firstName}
          lastSession={sessions[0]}
          openActionsCount={actions.length}
          openActionsClientCount={uniqueActionClients}
          attentionClient={attentionClient?.name}
        />

        <MetricCards
          lastSession={sessions[0]}
          actions={actions}
          attentionClient={attentionClient}
          pendingUploads={pendingUploads}
        />

        <RecentClientsChips
          clients={clients ?? []}
          sessions={sessions}
          actions={actions}
        />

        {/* 2-col grid 58/42 */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '58fr 42fr' }}
        >
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
            <ActionItemsSection
              actions={actions}
              attentionClient={attentionClient}
              pendingUploadClient={pendingUploadClient}
              nextSessionClient={nextSessionClient}
            />
          </div>
        </div>
      </div>

      <SolisFab />
    </div>
  );
}
