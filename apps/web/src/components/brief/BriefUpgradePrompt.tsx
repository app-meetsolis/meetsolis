/**
 * BriefUpgradePrompt — shown when a Free coach opens a brief screen (Story 6.4).
 * The dedicated Coach Brief screen is Pro-only; Free coaches use Solis chat.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BriefUpgradePrompt() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-[18px] font-bold text-foreground">
        Coach Brief is a Pro feature
      </h1>
      <p className="mt-1.5 max-w-[320px] text-[13px] text-foreground/45">
        Upgrade to unlock auto-generated session prep before every meeting.
      </p>
      <Button
        onClick={() => router.push('/settings')}
        className="mt-6 gap-2 text-[13px] font-semibold"
      >
        Upgrade to Pro
        <span aria-hidden>→</span>
      </Button>
    </div>
  );
}
