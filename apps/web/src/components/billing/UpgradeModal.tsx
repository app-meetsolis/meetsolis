'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { UsageLimitType } from '@meetsolis/shared';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: UsageLimitType;
}

const LIMIT_CONTENT: Record<
  UsageLimitType,
  { title: string; description: string }
> = {
  client: {
    title: "You've reached your client limit",
    description:
      'Free plan supports up to 3 clients. Upgrade to Pro for unlimited clients, 25 AI sessions/month, and 2,000 Solis queries/month.',
  },
  transcript: {
    title: "You've used all your free AI sessions",
    description:
      'Free plan includes 5 lifetime AI session summaries. Upgrade to Pro for 25 AI sessions per month.',
  },
  query: {
    title: "You've reached your Solis query limit",
    description:
      'Free plan includes 75 lifetime Solis queries. Upgrade to Pro for 2,000 queries per month.',
  },
};

export function UpgradeModal({
  isOpen,
  onClose,
  limitType,
}: UpgradeModalProps) {
  const content = LIMIT_CONTENT[limitType];

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        console.error('Checkout failed:', data.error);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handleSeeFeatures = () => {
    window.location.href = '/pricing';
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-400/15 p-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-foreground">
              {content.title}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-[13px] text-muted-foreground">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSeeFeatures}
            className="border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            See all Pro features
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-primary text-primary-foreground font-semibold hover:bg-primary/85"
          >
            Upgrade to Pro — $99/month
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
