/**
 * Clients Dashboard Page
 * Story 2.2: Client Dashboard UI (Grid View)
 *
 * Displays all clients in a responsive grid layout with:
 * - 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
 * - Loading, empty, and error states
 * - Client cards with hover effects
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Client } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientGrid } from '@/components/clients/ClientGrid';
import { ClientGridSkeleton } from '@/components/clients/ClientGridSkeleton';
import { ClientEmptyState } from '@/components/clients/ClientEmptyState';
import { ClientErrorState } from '@/components/clients/ClientErrorState';

/**
 * Fetch clients from API
 * @returns Array of clients for authenticated user
 */
async function fetchClients(): Promise<Client[]> {
  const response = await fetch('/api/clients', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch clients');
  }

  const data = await response.json();
  return data.clients;
}

export default function ClientsPage() {
  // React Query for data fetching with automatic refetch on window focus
  const {
    data: clients,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true, // Override global setting for this query
  });

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Clients</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Manage your professional relationships
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              // TODO: Open add client modal (Story 2.3)
              console.log('Add client clicked');
            }}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Content States */}
        {isLoading && <ClientGridSkeleton />}

        {isError && (
          <ClientErrorState
            error={error instanceof Error ? error.message : 'An error occurred'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && clients && clients.length === 0 && (
          <ClientEmptyState />
        )}

        {!isLoading && !isError && clients && clients.length > 0 && (
          <ClientGrid clients={clients} />
        )}
      </div>
    </div>
  );
}
