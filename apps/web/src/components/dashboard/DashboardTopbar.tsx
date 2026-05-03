'use client';

import { Search, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import type { UsageResponse } from '@meetsolis/shared';

interface Props {
  usage?: UsageResponse;
}

export function DashboardTopbar({ usage }: Props) {
  const tCount = usage?.transcript_count ?? 0;
  const tMax = usage?.transcript_limit ?? 5;
  const qCount = usage?.query_count ?? 0;
  const qMax = usage?.query_limit ?? 75;
  const tPct = Math.min((tCount / tMax) * 100, 100);
  const qPct = Math.min((qCount / qMax) * 100, 100);

  return (
    <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-2 bg-muted border border-border rounded-[9px] px-3 h-[34px] max-w-[320px] flex-1">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search clients, sessions, insights…"
          className="border-none bg-transparent h-full p-0 text-[13.5px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="font-mono text-[12px] text-muted-foreground tracking-[0.02em]">
          {format(new Date(), 'EEEE, MMM d · yyyy')}
        </span>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
          <div className="w-7 h-[3px] bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${tPct}%` }}
            />
          </div>
          <span>
            {tCount} / {tMax} transcripts
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
          <div className="w-7 h-[3px] bg-accent rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${qPct}%`, background: 'var(--primary)' }}
            />
          </div>
          <span>
            {qCount.toLocaleString()} /{' '}
            {qMax >= 1000 ? `${qMax / 1000}k` : qMax} queries
          </span>
        </div>

        <div className="w-px h-5 bg-border" />

        <button className="relative w-[34px] h-[34px] flex items-center justify-center rounded-[9px] bg-muted border border-border cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] bg-primary rounded-full border-2 border-card" />
        </button>
      </div>
    </div>
  );
}
