'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SessionWithClient, ActionItemWithClient } from './types';

interface Props {
  attentionClient?: { name: string; daysSince: number };
  actions: ActionItemWithClient[];
  sessions: SessionWithClient[];
}

export function ProactiveSolisCard({
  attentionClient,
  actions,
  sessions,
}: Props) {
  const router = useRouter();

  let insight: string;
  let ctaText: string;
  let ctaQuery: string;

  if (attentionClient) {
    const clientActions = actions.filter(
      a => a.client_name === attentionClient.name
    );
    const overdueCount = clientActions.filter(
      a => a.due_date && new Date(a.due_date) < new Date()
    ).length;
    insight = `${attentionClient.name} hasn't had a session in ${attentionClient.daysSince} days — the longest gap in your portfolio${overdueCount > 0 ? `, with ${overdueCount} overdue action${overdueCount !== 1 ? 's' : ''}` : ''}.`;
    ctaText = `Prepare for ${attentionClient.name.split(' ')[0]}`;
    ctaQuery = `What's the status of my coaching work with ${attentionClient.name}? What should I focus on for our next session?`;
  } else if (sessions.length > 0) {
    const lastClient = sessions[0].client_name;
    insight = `${lastClient} was your most recent session. Your coaching portfolio looks healthy — all clients seen recently.`;
    ctaText = `Ask about ${lastClient.split(' ')[0]}`;
    ctaQuery = `Prepare me for my next coaching session with ${lastClient}. What should I focus on based on their history?`;
  } else {
    insight =
      'Upload your first transcript to unlock AI insights across your coaching portfolio.';
    ctaText = 'Explore Solis';
    ctaQuery = 'How do I get started with MeetSolis coaching intelligence?';
  }

  return (
    <Card className="rounded-[12px] border-0 shadow-card">
      <CardContent className="flex items-center justify-between gap-4 px-[22px] py-[14px]">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.09em] mb-0.5">
              Solis Proactive Insight
            </div>
            <div className="text-[13.5px] text-foreground leading-[1.4]">
              {insight}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            router.push(`/intelligence?q=${encodeURIComponent(ctaQuery)}`)
          }
          className="h-8 px-4 gap-1.5 text-[13px] shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
}
