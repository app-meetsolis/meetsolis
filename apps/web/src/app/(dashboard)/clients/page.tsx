/**
 * Clients Dashboard Page
 * v3: Executive coach pivot — 1 free client, no tags, session-aware sort
 */

'use client';

import { Suspense, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Client } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientGrid } from '@/components/clients/ClientGrid';
import { ClientGridSkeleton } from '@/components/clients/ClientGridSkeleton';
import { ClientEmptyState } from '@/components/clients/ClientEmptyState';
import { ClientErrorState } from '@/components/clients/ClientErrorState';
import { ClientModal } from '@/components/clients/ClientModal';
import { TierLimitDialog } from '@/components/clients/TierLimitDialog';
import { DeleteClientDialog } from '@/components/clients/DeleteClientDialog';
import { ClientSearch, SortOption } from '@/components/clients/ClientSearch';
import { ClientSearchEmpty } from '@/components/clients/ClientSearchEmpty';
import { Toaster } from 'sonner';

async function fetchClients(): Promise<Client[]> {
  const response = await fetch('/api/clients', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch clients');
    } catch {
      throw new Error('Failed to fetch clients');
    }
  }
  const data = await response.json();
  return data.clients;
}

function ClientsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );
  const [isTierLimitDialogOpen, setIsTierLimitDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-added');

  const {
    data: clients,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Free tier: 3 client max. Pro: unlimited (API enforces this too)
  const maxClients = 3;
  const clientCount = clients?.length || 0;
  const canAddClient = clientCount < maxClients;

  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return [];

    let filtered = clients;
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = clients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });
    }

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'last-session': {
          const dateA = a.last_session_at
            ? new Date(a.last_session_at).getTime()
            : 0;
          const dateB = b.last_session_at
            ? new Date(b.last_session_at).getTime()
            : 0;
          return dateB - dateA;
        }
        case 'date-added':
        default: {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      }
    });
  }, [clients, searchQuery, sortOption]);

  const handleAddClient = () => {
    if (!canAddClient) {
      setIsTierLimitDialogOpen(true);
      return;
    }
    setModalMode('create');
    setSelectedClient(undefined);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
  };

  const handleSearchChange = useCallback(
    (query: string) => setSearchQuery(query),
    []
  );
  const handleSortChange = useCallback(
    (sort: SortOption) => setSortOption(sort),
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/clients?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchEmpty =
    hasSearchQuery && filteredAndSortedClients.length === 0;
  const showNoClients = !hasSearchQuery && clients && clients.length === 0;
  const showResults =
    !isLoading && !isError && filteredAndSortedClients.length > 0;

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      <Toaster position="top-right" duration={3000} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Clients</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Your coaching clients</p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddClient}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {!isLoading && !isError && clients && clients.length > 0 && (
          <ClientSearch
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
          />
        )}

        {isLoading && <ClientGridSkeleton />}

        {isError && (
          <ClientErrorState
            error={error instanceof Error ? error.message : 'An error occurred'}
            onRetry={() => refetch()}
          />
        )}

        {showNoClients && <ClientEmptyState onAddClient={handleAddClient} />}

        {showSearchEmpty && (
          <ClientSearchEmpty
            query={searchQuery}
            onClearSearch={handleClearSearch}
          />
        )}

        {showResults && (
          <ClientGrid
            clients={filteredAndSortedClients}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        client={selectedClient}
      />

      <TierLimitDialog
        isOpen={isTierLimitDialogOpen}
        onClose={() => setIsTierLimitDialogOpen(false)}
        currentCount={clientCount}
        maxClients={maxClients}
      />

      <DeleteClientDialog
        client={clientToDelete}
        isOpen={clientToDelete !== null}
        onClose={() => setClientToDelete(null)}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientGridSkeleton />}>
      <ClientsPageContent />
    </Suspense>
  );
}
