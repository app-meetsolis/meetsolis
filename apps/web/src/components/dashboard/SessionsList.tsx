'use client';

import { useRouter } from 'next/navigation';
import { format, differenceInDays, parseISO } from 'date-fns';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SessionWithClient } from './types';

interface Props {
  sessions: SessionWithClient[];
}

export function SessionsList({ sessions }: Props) {
  const router = useRouter();
  const recent = sessions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <p className="text-[13px] text-muted-foreground">
          No sessions yet — upload your first transcript
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recent.map(session => {
        const daysSince = session.session_date
          ? differenceInDays(new Date(), parseISO(session.session_date))
          : null;
        const overdue = daysSince !== null && daysSince >= 14;
        const dateStr = session.session_date
          ? format(parseISO(session.session_date), 'MMM d')
          : '—';
        const excerpt = session.summary ? session.summary.slice(0, 140) : '';

        const prepareQuery = encodeURIComponent(
          `Prepare me for my next coaching session with ${session.client_name}. What should I focus on based on their history?`
        );

        return (
          <Card
            key={session.id}
            onClick={() =>
              router.push(
                `/clients/${session.client_id}/sessions/${session.id}`
              )
            }
            className="rounded-[12px] cursor-pointer hover:-translate-y-px transition-all"
          >
            <CardContent className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                <span className="text-[12px] font-semibold text-primary">
                  {session.client_name}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  · {dateStr}
                </span>
                {overdue && daysSince !== null && (
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {daysSince}d ago
                  </span>
                )}
              </div>
              <div className="text-[14px] font-medium text-foreground mb-2 leading-[1.4]">
                {session.title}
              </div>
              {excerpt && (
                <div className="text-[13px] text-muted-foreground leading-[1.6] mb-3 line-clamp-2">
                  {excerpt}
                </div>
              )}
              <div
                className="flex items-center justify-between"
                onClick={e => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className="gap-1 text-[12px] rounded-md"
                >
                  <CheckCircle2 className="h-[13px] w-[13px]" />
                  <span>
                    {session.status === 'complete'
                      ? 'Complete'
                      : session.status}
                  </span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/intelligence?q=${prepareQuery}`)}
                  className="text-[12px] font-medium px-3 py-1 h-auto rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                >
                  Prepare with Solis{' '}
                  <Sparkles className="inline h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
