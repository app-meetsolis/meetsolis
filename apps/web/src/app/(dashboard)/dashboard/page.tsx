/**
 * Dashboard Home Page
 * v3: Executive coach home — coaching-focused welcome, quick actions
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, getDisplayName } from '@/hooks/useUserProfile';
import { useQuery } from '@tanstack/react-query';
import { Users, Sparkles, Upload, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Client } from '@meetsolis/shared';

async function fetchClients(): Promise<Client[]> {
  const response = await fetch('/api/clients');
  if (!response.ok) return [];
  const data = await response.json();
  return data.clients ?? [];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const isLoading = authLoading || profileLoading;
  const firstName = getDisplayName(profile).split(' ')[0];
  const clientCount = clients?.length ?? 0;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="mt-2 text-[#6B7280]">
          Never forget a client&apos;s breakthrough moment again.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">
              Active Clients
            </span>
            <Users className="h-5 w-5 text-[#001F3F]" />
          </div>
          {clientsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold text-[#1A1A1A]">{clientCount}</p>
          )}
          <p className="mt-1 text-xs text-[#6B7280]">
            {clientCount === 0
              ? 'Add your first client to get started'
              : 'coaching relationships'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">
              Sessions Logged
            </span>
            <Upload className="h-5 w-5 text-[#001F3F]" />
          </div>
          <p className="text-3xl font-bold text-[#1A1A1A]">—</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Upload transcripts to track sessions
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">
              Solis Queries
            </span>
            <Sparkles className="h-5 w-5 text-[#001F3F]" />
          </div>
          <p className="text-3xl font-bold text-[#1A1A1A]">—</p>
          <p className="mt-1 text-xs text-[#6B7280]">Available in Story 4.3</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Quick Actions</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/clients"
          className="group flex items-center justify-between rounded-xl bg-[#001F3F] p-6 text-white transition-all hover:bg-[#003366]"
        >
          <div>
            <p className="font-semibold text-lg">
              {clientCount === 0 ? 'Add Your First Client' : 'View Clients'}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {clientCount === 0
                ? 'Start building your coaching practice'
                : `Manage your ${clientCount} client${clientCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 opacity-70 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/intelligence"
          className="group flex items-center justify-between rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div>
            <p className="font-semibold text-lg text-[#1A1A1A]">Ask Solis</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Query your session history with AI
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#6B7280] transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
