'use client';

import { Clock, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import type { SessionWithClient, ActionItemWithClient } from './types';

interface Props {
  lastSession?: SessionWithClient;
  actions: ActionItemWithClient[];
  attentionClient?: { name: string; daysSince: number };
  pendingUploads: number;
}

function Sparkline({ bars }: { bars: number[] }) {
  return (
    <div className="flex items-end gap-[3px] h-5 mt-3">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[5px] rounded-sm"
          style={{
            height: `${h}%`,
            background: 'var(--primary)',
            opacity:
              i === bars.length - 1 ? 1 : i > bars.length - 3 ? 0.35 : 0.15,
          }}
        />
      ))}
    </div>
  );
}

interface CardProps {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  sub: React.ReactNode;
  sparkBars: number[];
}

function MetricCard({ label, icon, value, sub, sparkBars }: CardProps) {
  return (
    <Card className="rounded-[12px] cursor-pointer transition-all hover:-translate-y-px">
      <CardContent className="px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-primary">{icon}</div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
            {label}
          </span>
        </div>
        <div className="text-[20px] font-semibold text-foreground tracking-[-0.02em] leading-[1.2] mb-1.5">
          {value}
        </div>
        <div className="text-[13px] text-muted-foreground">{sub}</div>
        <Sparkline bars={sparkBars} />
      </CardContent>
    </Card>
  );
}

export function MetricCards({
  lastSession,
  actions,
  attentionClient,
  pendingUploads,
}: Props) {
  const overdueActions = actions.filter(
    a => a.due_date && new Date(a.due_date) < new Date()
  ).length;
  const uniqueActionClients = new Set(actions.map(a => a.client_id)).size;

  const lastSessionDate = lastSession?.session_date
    ? format(parseISO(lastSession.session_date), 'MMM d')
    : null;
  const lastSessionDaysAgo = lastSession?.session_date
    ? differenceInDays(new Date(), parseISO(lastSession.session_date))
    : null;

  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Last Session"
        icon={<Clock className="h-3.5 w-3.5" />}
        value={lastSession ? lastSession.client_name : '—'}
        sub={
          lastSession && lastSessionDate ? (
            <>
              {lastSessionDate} ·{' '}
              <span className="text-primary font-medium">
                {lastSessionDaysAgo}d ago
              </span>
            </>
          ) : (
            'No sessions yet'
          )
        }
        sparkBars={[30, 50, 65, 82, 100]}
      />
      <MetricCard
        label="Open Actions"
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        value={actions.length > 0 ? `${actions.length} remaining` : 'All clear'}
        sub={
          actions.length > 0 ? (
            <>
              Across{' '}
              <span className="text-primary font-medium">
                {uniqueActionClients} client
                {uniqueActionClients !== 1 ? 's' : ''}
              </span>
              {overdueActions > 0 ? ` · ${overdueActions} overdue` : ''}
            </>
          ) : (
            'No open action items'
          )
        }
        sparkBars={[100, 80, 60, 40, 30]}
      />
      <MetricCard
        label="Needs Attention"
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        value={
          attentionClient ? (
            attentionClient.name
          ) : (
            <span className="text-primary">All good</span>
          )
        }
        sub={
          attentionClient ? (
            <>
              <span className="text-foreground font-medium">
                {attentionClient.daysSince} days
              </span>{' '}
              since last session
            </>
          ) : (
            'No clients overdue'
          )
        }
        sparkBars={[70, 85, 30, 12, 5]}
      />
      <MetricCard
        label="Pending Uploads"
        icon={<Upload className="h-3.5 w-3.5" />}
        value={
          pendingUploads > 0
            ? `${pendingUploads} session${pendingUploads !== 1 ? 's' : ''}`
            : 'All uploaded'
        }
        sub={
          pendingUploads > 0 ? (
            <>
              Awaiting{' '}
              <span className="text-primary font-medium">transcript</span>{' '}
              upload
            </>
          ) : (
            'No pending uploads'
          )
        }
        sparkBars={[40, 60, 80, 60, 90]}
      />
    </div>
  );
}
