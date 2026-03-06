'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CreditCard, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FREE_LIMITS } from '@meetsolis/shared';

async function fetchSubscription() {
  const res = await fetch('/api/subscriptions/status');
  if (!res.ok) return null;
  return res.json();
}

export default function SettingsPage() {
  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  const isPro = sub?.plan === 'pro' && sub?.status === 'active';

  const checkoutMutation = useMutation({
    mutationFn: async (plan: 'monthly' | 'annual') => {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      return res.json();
    },
    onSuccess: data => {
      window.location.href = data.url;
    },
    onError: () => toast.error('Failed to open checkout'),
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to open portal');
      return res.json();
    },
    onSuccess: data => {
      window.location.href = data.url;
    },
    onError: () => toast.error('Failed to open billing portal'),
  });

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-[#1A1A1A]">Settings</h1>

        {/* Billing */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E4DD]">
              <CreditCard className="h-5 w-5 text-[#001F3F]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1A1A1A]">Billing</h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isPro ? 'default' : 'secondary'}
                  className={isPro ? 'bg-[#001F3F]' : ''}
                >
                  {isPro ? 'Pro' : 'Free'}
                </Badge>
              </div>
            </div>
          </div>

          {isPro ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Pro Plan Active</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-green-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" /> Unlimited clients
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" /> Unlimited transcripts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" /> 2,000 Solis queries/month
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
              >
                <ExternalLink className="h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current limits */}
              <div className="rounded-lg bg-[#E8E4DD] p-4 text-sm">
                <p className="font-medium text-[#1A1A1A] mb-2">
                  Free Plan Limits
                </p>
                <ul className="space-y-1 text-[#6B7280]">
                  <li>{FREE_LIMITS.clients} client</li>
                  <li>
                    {FREE_LIMITS.transcripts_lifetime} transcripts (lifetime)
                  </li>
                  <li>
                    {FREE_LIMITS.queries_lifetime} Solis queries (lifetime)
                  </li>
                </ul>
              </div>

              {/* Upgrade options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border-2 border-[#001F3F] p-4">
                  <p className="font-semibold text-[#1A1A1A]">Monthly</p>
                  <p className="text-2xl font-bold text-[#001F3F]">
                    $99
                    <span className="text-base font-normal text-[#6B7280]">
                      /mo
                    </span>
                  </p>
                  <Button
                    className="mt-4 w-full bg-[#001F3F] hover:bg-[#003366]"
                    onClick={() => checkoutMutation.mutate('monthly')}
                    disabled={checkoutMutation.isPending}
                  >
                    Upgrade to Pro
                  </Button>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-[#1A1A1A]">Annual</p>
                  <p className="text-2xl font-bold text-[#001F3F]">
                    $79
                    <span className="text-base font-normal text-[#6B7280]">
                      /mo
                    </span>
                  </p>
                  <p className="text-xs text-green-600">Save $240/year</p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => checkoutMutation.mutate('annual')}
                    disabled={checkoutMutation.isPending}
                  >
                    Upgrade Annual
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
