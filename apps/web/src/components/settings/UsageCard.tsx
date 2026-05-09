'use client';

import { Progress } from '@/components/ui/progress';
import type { UsageResponse } from '@meetsolis/shared';

interface Props {
  usage: UsageResponse;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface BarProps {
  label: string;
  count: number;
  limit: number;
}

function UsageBar({ label, count, limit }: BarProps) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited
    ? 0
    : Math.min(100, Math.round((count / limit) * 100));
  const limitLabel = isUnlimited ? '—' : String(limit);
  const countLabel = isUnlimited ? String(count) : `${count} / ${limit}`;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[13px]">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{countLabel}</span>
      </div>
      {!isUnlimited && <Progress value={pct} className="h-1.5" />}
      {isUnlimited && (
        <div className="text-[12px] text-muted-foreground">
          {limitLabel} (unlimited)
        </div>
      )}
    </div>
  );
}

export function UsageCard({ usage }: Props) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-4">
      <h3 className="text-[15px] font-semibold text-foreground">Usage</h3>
      <UsageBar
        label="Clients"
        count={usage.client_count}
        limit={usage.client_limit}
      />
      <UsageBar
        label="Transcripts"
        count={usage.transcript_count}
        limit={usage.transcript_limit}
      />
      <UsageBar
        label="Solis queries"
        count={usage.query_count}
        limit={usage.query_limit}
      />
      <p className="text-[12px] text-muted-foreground pt-1">
        {usage.tier === 'pro'
          ? usage.resets_at
            ? `Resets ${formatDate(usage.resets_at)}`
            : 'Pro plan'
          : 'Lifetime usage'}
      </p>
    </div>
  );
}
