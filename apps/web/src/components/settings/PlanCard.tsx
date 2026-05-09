'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelDialog } from './CancelDialog';
import type { UsageResponse } from '@meetsolis/shared';

interface Props {
  usage: UsageResponse;
  onRefetch: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PlanCard({ usage, onRefetch }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const { tier, cancel_at_period_end, current_period_end } = usage;

  async function handleUpgrade(plan: 'monthly' | 'annual') {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url)
        throw new Error(data.error ?? 'checkout failed');
      window.location.href = data.url;
    } catch {
      toast.error('Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  }

  async function handleResume() {
    setResuming(true);
    try {
      const res = await fetch('/api/billing/resume', { method: 'POST' });
      if (!res.ok) throw new Error('resume failed');
      toast.success('Subscription resumed.');
      onRefetch();
    } catch {
      toast.error('Failed to resume. Please try again.');
    } finally {
      setResuming(false);
    }
  }

  return (
    <>
      <div className="rounded-[12px] border border-border bg-card p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-foreground">Plan</h3>

        {tier === 'free' && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="secondary">Free</Badge>
              <p className="text-[13px] text-muted-foreground">
                3 clients · 5 lifetime transcripts · 75 queries
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleUpgrade('monthly')}
              disabled={checkingOut}
            >
              {checkingOut ? 'Redirecting…' : 'Upgrade to Pro'}
            </Button>
          </div>
        )}

        {tier === 'pro' && cancel_at_period_end && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Pro · Cancels {formatDate(current_period_end)}
              </Badge>
              <button
                className="text-[13px] text-primary hover:underline"
                onClick={handleResume}
                disabled={resuming}
              >
                {resuming ? 'Resuming…' : 'Resume subscription'}
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Your Pro access continues until {formatDate(current_period_end)}.
            </p>
          </div>
        )}

        {tier === 'pro' && !cancel_at_period_end && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant="secondary">Pro</Badge>
                <p className="text-[13px] text-muted-foreground">
                  Renews {formatDate(current_period_end)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelOpen(true)}
              >
                Cancel subscription
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleUpgrade('annual')}
              disabled={checkingOut}
            >
              {checkingOut ? 'Redirecting…' : 'Switch to annual (save $240)'}
            </Button>
          </div>
        )}
      </div>

      <CancelDialog
        open={cancelOpen}
        periodEnd={current_period_end}
        onClose={() => setCancelOpen(false)}
        onCancelled={onRefetch}
      />
    </>
  );
}
