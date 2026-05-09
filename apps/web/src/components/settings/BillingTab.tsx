'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Zap, Mail, FileText } from 'lucide-react';
import { PlanCard } from './PlanCard';
import { UsageCard } from './UsageCard';
import type { UsageResponse } from '@meetsolis/shared';

async function fetchUsage(): Promise<UsageResponse> {
  const res = await fetch('/api/usage');
  if (!res.ok) throw new Error('Failed to load usage');
  return res.json() as Promise<UsageResponse>;
}

const FREE_FEATURES = [
  '3 active clients',
  '5 lifetime transcript uploads',
  '75 lifetime Solis AI queries',
  'Full session timeline per client',
  'Action item tracking',
];

const PRO_FEATURES = [
  'Unlimited active clients',
  '25 transcript uploads / month',
  '2,000 Solis AI queries / month',
  'Full session timeline per client',
  'Action item tracking',
  'Priority support',
  'Early access to new features',
];

function WhatsIncludedCard({ tier }: { tier: 'free' | 'pro' }) {
  const features = tier === 'pro' ? PRO_FEATURES : FREE_FEATURES;
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-3 h-full">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-[15px] font-semibold text-foreground">
          {tier === 'pro'
            ? "What's included in Pro"
            : "What's included in Free"}
        </h3>
      </div>
      <ul className="space-y-2">
        {features.map(f => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] text-muted-foreground"
          >
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {tier === 'free' && (
        <p className="text-[12px] text-muted-foreground border-t border-border pt-3">
          Pro is $99/mo or $948/yr — save $240. Cancel anytime, access continues
          to period end.
        </p>
      )}
    </div>
  );
}

function PaymentInfoCard() {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-4 h-full">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[15px] font-semibold text-foreground">
          Invoices & payments
        </h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-[8px] bg-muted/50">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-foreground">
              Invoices by email
            </p>
            <p className="text-[12px] text-muted-foreground">
              Sent automatically to your account email after each billing cycle.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-[8px] bg-muted/50 space-y-1">
          <p className="text-[13px] font-medium text-foreground">
            Update payment method
          </p>
          <p className="text-[12px] text-muted-foreground">
            Email{' '}
            <a
              href="mailto:support@meetsolis.com"
              className="text-primary hover:underline"
            >
              support@meetsolis.com
            </a>{' '}
            and we&apos;ll send a secure update link within one business day.
          </p>
        </div>
        <div className="p-3 rounded-[8px] bg-muted/50 space-y-1">
          <p className="text-[13px] font-medium text-foreground">
            Questions about your bill?
          </p>
          <p className="text-[12px] text-muted-foreground">
            Reach us at{' '}
            <a
              href="mailto:support@meetsolis.com"
              className="text-primary hover:underline"
            >
              support@meetsolis.com
            </a>
            . We respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`rounded-[12px] border border-border bg-card p-5 animate-pulse ${tall ? 'min-h-[200px]' : 'min-h-[100px]'}`}
    >
      <div className="h-4 w-28 bg-muted rounded mb-3" />
      <div className="h-3 w-full bg-muted rounded mb-2" />
      <div className="h-3 w-3/4 bg-muted rounded" />
    </div>
  );
}

function BillingLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="space-y-4">
        <SkeletonCard tall />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function BillingTab() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
  });

  function refetch() {
    void queryClient.invalidateQueries({ queryKey: ['usage'] });
  }

  if (isLoading) return <BillingLoadingSkeleton />;

  if (isError || !data) {
    return (
      <div className="text-[13px] text-destructive">
        Failed to load billing info. Please refresh.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* Left column */}
      <div className="space-y-4">
        <PlanCard usage={data} onRefetch={refetch} />
        <UsageCard usage={data} />
      </div>
      {/* Right column */}
      <div className="space-y-4">
        <WhatsIncludedCard tier={data.tier} />
        <PaymentInfoCard />
      </div>
    </div>
  );
}
