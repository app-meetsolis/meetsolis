'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';
import type { Client } from '@meetsolis/shared';
import type { SessionWithClient, ActionItemWithClient } from './types';

interface Props {
  clients: Client[];
  actions: ActionItemWithClient[];
  attentionClient?: { name: string; daysSince: number };
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

export function StatCards({
  clients,
  actions,
  attentionClient,
  sessions,
}: Props) {
  const router = useRouter();
  const now = new Date();

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const activeThisMonth = clients.filter(
    c => c.last_session_at && new Date(c.last_session_at) >= thirtyDaysAgo
  ).length;
  const activeLastMonth = clients.filter(
    c =>
      c.last_session_at &&
      new Date(c.last_session_at) >= sixtyDaysAgo &&
      new Date(c.last_session_at) < thirtyDaysAgo
  ).length;
  const change = activeThisMonth - activeLastMonth;

  const clientsWithStatus = clients.map(c => {
    const lastSess = sessions.find(s => s.client_id === c.id);
    const days = lastSess?.session_date
      ? differenceInDays(now, new Date(lastSess.session_date))
      : null;
    return { ...c, days, isActive: days !== null && days <= 30 };
  });

  const fillPct =
    clients.length > 0 ? (activeThisMonth / clients.length) * 100 : 0;

  const sessionsThisMonth = sessions.filter(
    s => s.session_date && new Date(s.session_date) >= thirtyDaysAgo
  ).length;

  const attentionClients = [...clients]
    .map(c => ({
      id: c.id,
      name: c.name,
      daysSince: c.last_session_at
        ? differenceInDays(now, new Date(c.last_session_at))
        : 999,
    }))
    .filter(c => c.daysSince >= 14)
    .sort((a, b) => b.daysSince - a.daysSince);

  let insightName: string | null;
  let insightBody: string;
  let primaryQuery: string;
  let ghostLabel: string;
  let ghostQuery: string;

  if (attentionClient) {
    insightName = attentionClient.name;
    insightBody = `hasn't had a session in ${attentionClient.daysSince} days.`;
    primaryQuery = `What should I focus on for my next coaching session with ${attentionClient.name}? Summarise their recent progress and open actions.`;
    ghostLabel = 'Ask Solis';
    ghostQuery = `Give me a summary of how all my clients are progressing right now.`;
  } else if (sessions[0]) {
    insightName = sessions[0].client_name;
    insightBody = `was your most recent session. Portfolio looks healthy.`;
    primaryQuery = `Prepare me for my next coaching session with ${sessions[0].client_name}. What should I focus on?`;
    ghostLabel = 'Portfolio check';
    ghostQuery = `Give me a summary of how all my clients are progressing right now.`;
  } else {
    insightName = null;
    insightBody =
      'Upload your first transcript to unlock AI insights across your coaching portfolio.';
    primaryQuery = 'How do I get started with MeetSolis?';
    ghostLabel = 'View clients';
    ghostQuery = '';
  }

  const clientFirst = insightName?.split(' ')[0] ?? '';
  const rotatingPrompts = insightName
    ? [
        `Summarise ${clientFirst}'s recent progress`,
        `What are ${clientFirst}'s open action items?`,
        `Prepare me for ${clientFirst}'s next session`,
        `What goals is ${clientFirst} working towards?`,
      ]
    : [
        'Which client needs attention most?',
        'Summarise my coaching portfolio',
        'Get key insights from any session',
        'Ask anything about your clients',
      ];

  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptVisible(false);
      setTimeout(() => {
        setPromptIdx(i => (i + 1) % rotatingPrompts.length);
        setPromptVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* ── Card 1: Active Clients ─────────────────────────── */}
      <Card className="rounded-[12px] border-0 shadow-card">
        <CardContent className="px-5 py-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
              Active Clients
            </span>
          </div>

          {/* Number + change */}
          <div className="flex items-end justify-between mb-1">
            <div className="text-[36px] font-semibold text-foreground tracking-[-0.04em] leading-[1]">
              {activeThisMonth}
              <span className="text-[20px] text-muted-foreground font-normal">
                /{clients.length}
              </span>
            </div>
            {change !== 0 && (
              <span
                className={`text-[12px] font-medium mb-1 ${change > 0 ? 'text-primary' : 'text-red-400'}`}
              >
                {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`} vs last
                month
              </span>
            )}
          </div>
          <div className="text-[13px] text-muted-foreground mb-3">
            active this month
          </div>

          {/* Progress bar — always visible, gray track + green fill */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 mb-3">
            <span className="text-[12px] text-muted-foreground">
              {activeThisMonth} active
            </span>
            <span className="text-[12px] text-muted-foreground">
              {clients.length - activeThisMonth} inactive
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Max 3 overlapping avatars + session count */}
          <div className="flex items-center">
            <div className="flex">
              {clientsWithStatus.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  title={`${c.name}: ${c.days !== null ? `${c.days}d ago` : 'no sessions'}`}
                  style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }}
                  className={`w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    c.isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {initials(c.name)}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground ml-3">
              {sessionsThisMonth} session{sessionsThisMonth !== 1 ? 's' : ''}{' '}
              this month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Needs Attention ────────────────────────── */}
      <Card className="rounded-[12px] border-0 shadow-card">
        <CardContent className="px-5 py-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
              Needs Attention
            </span>
          </div>

          {attentionClients.length > 0 ? (
            <div className="flex flex-col">
              {attentionClients.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < Math.min(attentionClients.length, 3) - 1
                      ? 'border-b border-border'
                      : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground leading-[1.2] truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {c.daysSince === 999
                        ? 'No sessions yet'
                        : `${c.daysSince}d since last session`}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      c.daysSince > 30
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {c.daysSince === 999 ? '—' : `${c.daysSince}d`}
                  </span>
                </div>
              ))}
              {attentionClients.length > 3 && (
                <div className="text-[11px] text-muted-foreground pt-2">
                  +{attentionClients.length - 3} more clients
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center flex-1">
              <div className="text-[30px] font-semibold text-primary tracking-[-0.02em]">
                All good
              </div>
              <div className="text-[13px] text-muted-foreground mt-1.5">
                No clients overdue
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Solis Insight ──────────────────────────── */}
      <Card className="rounded-[12px] border-0 shadow-card">
        <CardContent className="px-5 py-4 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
              Solis Insight
            </span>
          </div>

          {/* Client mention + rotating example prompt */}
          <div className="flex-1">
            {insightName && (
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                  {initials(insightName)}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground leading-[1.2]">
                    {insightName}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {insightBody}
                  </div>
                </div>
              </div>
            )}

            {/* Rotating prompts */}
            <div className="rounded-lg bg-muted/60 px-3 py-2.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">
                Try asking
              </div>
              <div
                className="text-[12.5px] text-primary font-medium leading-[1.5] transition-opacity duration-500"
                style={{ opacity: promptVisible ? 1 : 0 }}
              >
                &ldquo;{rotatingPrompts[promptIdx]}&rdquo;
              </div>
            </div>
          </div>

          {/* Buttons pinned to bottom */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/intelligence?q=${encodeURIComponent(primaryQuery)}`
                )
              }
              className="flex-1 h-8 gap-1.5 text-[12px]"
            >
              <Sparkles className="h-3 w-3" />
              {attentionClient
                ? `Prepare for ${attentionClient.name.split(' ')[0]}`
                : 'Ask Solis'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                ghostQuery
                  ? router.push(
                      `/intelligence?q=${encodeURIComponent(ghostQuery)}`
                    )
                  : router.push('/clients')
              }
              className="flex-1 h-8 text-[12px]"
            >
              {ghostLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
