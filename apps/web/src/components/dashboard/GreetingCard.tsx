'use client';

import { useRouter } from 'next/navigation';
import { Upload, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SessionWithClient } from './types';

interface Props {
  greeting: string;
  firstName: string;
  lastSession?: SessionWithClient;
  openActionsCount: number;
  openActionsClientCount: number;
  attentionClient?: string;
}

export function GreetingCard({
  greeting,
  firstName,
  lastSession,
  openActionsCount,
  openActionsClientCount,
  attentionClient,
}: Props) {
  const router = useRouter();

  return (
    <Card className="rounded-[12px] border-border">
      <CardContent className="flex items-start justify-between gap-5 px-[22px] py-[18px]">
        <div>
          <div className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">
            {greeting}, {firstName}.
          </div>
          <div className="text-[13.5px] text-muted-foreground mt-1 leading-relaxed flex flex-wrap gap-x-1 items-center">
            {lastSession && (
              <span>
                Last session:{' '}
                <span className="text-secondary-foreground font-medium">
                  {lastSession.client_name}
                </span>{' '}
                ·{' '}
              </span>
            )}
            {openActionsCount > 0 && (
              <span>
                <span className="text-secondary-foreground font-medium">
                  {openActionsCount} open action
                  {openActionsCount !== 1 ? 's' : ''}
                </span>{' '}
                across {openActionsClientCount} client
                {openActionsClientCount !== 1 ? 's' : ''}
                {attentionClient ? (
                  <span className="text-muted-foreground"> · </span>
                ) : null}
              </span>
            )}
            {attentionClient && (
              <span className="text-muted-foreground">
                · {attentionClient} needs attention
              </span>
            )}
            {!lastSession && openActionsCount === 0 && !attentionClient && (
              <span>All clients are up to date.</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0 items-center">
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
      </CardContent>
    </Card>
  );
}
