'use client';

import { useState, useMemo } from 'react';
import { format, startOfDay, addDays, subDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { SessionWithClient } from './types';

type Range = 'week' | 'month' | '3months';

interface Props {
  sessions: SessionWithClient[];
}

const chartConfig: ChartConfig = {
  count: { label: 'Sessions', color: 'var(--primary)' },
};

// Inline style for tick so CSS vars resolve correctly
const tickStyle = {
  fill: 'hsl(var(--muted-foreground))',
  fontSize: 11,
} as const;

export function TrendsChart({ sessions }: Props) {
  const [range, setRange] = useState<Range>('3months');

  const data = useMemo(() => {
    const now = new Date();

    if (range === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const day = startOfDay(subDays(now, 6 - i));
        const next = addDays(day, 1);
        return {
          label: format(day, 'EEE'),
          count: sessions.filter(s => {
            if (!s.session_date) return false;
            const d = new Date(s.session_date);
            return d >= day && d < next;
          }).length,
        };
      });
    }

    if (range === 'month') {
      return Array.from({ length: 30 }, (_, i) => {
        const day = startOfDay(subDays(now, 29 - i));
        const next = addDays(day, 1);
        return {
          label: format(day, 'MMM d'),
          count: sessions.filter(s => {
            if (!s.session_date) return false;
            const d = new Date(s.session_date);
            return d >= day && d < next;
          }).length,
        };
      });
    }

    // 3 months — weekly buckets
    return Array.from({ length: 13 }, (_, i) => {
      const wkStart = startOfDay(subDays(now, (12 - i) * 7));
      const wkEnd = addDays(wkStart, 7);
      return {
        label: format(wkStart, 'MMM d'),
        count: sessions.filter(s => {
          if (!s.session_date) return false;
          const d = new Date(s.session_date);
          return d >= wkStart && d < wkEnd;
        }).length,
      };
    });
  }, [sessions, range]);

  const tabs: { key: Range; label: string }[] = [
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: '3months', label: '3 months' },
  ];

  return (
    <Card className="rounded-[12px] border-0 shadow-card">
      <CardContent className="px-5 py-5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.09em]">
            Sessions Trend
          </span>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setRange(t.key)}
                className={cn(
                  'px-3 py-1 rounded-md text-[12px] font-medium transition-colors',
                  range === t.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slightly darker plot area with crosshatch grid */}
        <div
          style={{
            background: 'rgba(0,0,0,0.22)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '4px 0',
          }}
        >
          <ChartContainer
            config={chartConfig}
            className="!aspect-auto h-[260px] w-full"
          >
            <AreaChart
              data={data}
              margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient
                  id="sessionsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-count)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={true}
                horizontal={true}
                strokeDasharray="2 4"
                stroke="rgba(255,255,255,0.07)"
              />
              <XAxis
                dataKey="label"
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                cursor={{
                  stroke: 'var(--color-count)',
                  strokeWidth: 1,
                  strokeOpacity: 0.3,
                }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.[0]) return null;
                  const v = payload[0].value as number;
                  return (
                    <div
                      className="bg-popover border border-border rounded-lg px-3 py-2 text-[12px] shadow-lg"
                      style={{ borderLeft: '3px solid hsl(var(--primary))' }}
                    >
                      <div className="text-muted-foreground mb-0.5">
                        {label}
                      </div>
                      <div className="font-semibold text-foreground text-[13px]">
                        {v} session{v !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                fill="url(#sessionsGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 0,
                  fill: 'hsl(var(--primary))',
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
