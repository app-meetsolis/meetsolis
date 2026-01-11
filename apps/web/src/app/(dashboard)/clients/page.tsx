/**
 * Clients Dashboard Page
 * Story 2.2: Client Dashboard UI (Grid View)
 * Story 2.3: Add/Edit Client Modal - Task 8 (Integration)
 * Story 2.4: Client Search & Filter - Task 8 (Integration)
 *
 * Displays all clients in a responsive grid layout with:
 * - 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
 * - Loading, empty, and error states
 * - Client cards with hover effects
 * - Add/Edit client modal integration
 * - Search/filter/sort functionality
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
import { ClientSearch, SortOption } from '@/components/clients/ClientSearch';
import { ClientSearchEmpty } from '@/components/clients/ClientSearchEmpty';
import { Toaster } from 'sonner';

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

function ClientsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );
  const [isTierLimitDialogOpen, setIsTierLimitDialogOpen] = useState(false);

  // Search/Filter state - Task 8 (Story 2.4)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-added');

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

  // Fetch user preferences for tier limit
  const { data: userPrefs } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      // Default to free tier max_clients if API doesn't exist yet
      return { max_clients: 3 };
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const maxClients = userPrefs?.max_clients || 3;
  const clientCount = clients?.length || 0;
  const canAddClient = clientCount < maxClients;

  /**
   * Filter and sort clients - Tasks 3, 4, 7 (Story 2.4)
   * Memoized for performance optimization
   */
  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return [];

    // Task 3: Search filtering (case-insensitive, name OR company)
    let filtered = clients;
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = clients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });
    }

    // Task 4: Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);

        case 'last-meeting': {
          const dateA = a.last_meeting_at
            ? new Date(a.last_meeting_at).getTime()
            : 0;
          const dateB = b.last_meeting_at
            ? new Date(b.last_meeting_at).getTime()
            : 0;
          return dateB - dateA; // Most recent first
        }

        case 'date-added':
        default: {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Newest first
        }
      }
    });

    return sorted;
  }, [clients, searchQuery, sortOption]);

  /**
   * Handle Add Client button click
   * Check tier limit before opening modal
   */
  const handleAddClient = () => {
    if (!canAddClient) {
      setIsTierLimitDialogOpen(true);
      return;
    }

    setModalMode('create');
    setSelectedClient(undefined);
    setIsModalOpen(true);
  };

  /**
   * Handle Edit Client
   * Open modal in edit mode with client data
   */
  const handleEditClient = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  /**
   * Handle search query changes - Task 8 (Story 2.4)
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Handle sort option changes - Task 8 (Story 2.4)
   */
  const handleSortChange = useCallback((sort: SortOption) => {
    setSortOption(sort);
  }, []);

  /**
   * Handle clear search - Task 5 (Story 2.4)
   * Reset query and URL params
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/clients?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Determine if showing search empty state vs no clients state
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchEmpty =
    hasSearchQuery && filteredAndSortedClients.length === 0;
  const showNoClients = !hasSearchQuery && clients && clients.length === 0;
  const showResults =
    !isLoading && !isError && filteredAndSortedClients.length > 0;

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      {/* Sonner Toast Notifications */}
      <Toaster position="top-right" duration={3000} />

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Clients</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Manage your professional relationships
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddClient}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Search/Filter Bar - Task 8 (Story 2.4) */}
        {!isLoading && !isError && clients && clients.length > 0 && (
          <ClientSearch
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
          />
        )}

        {/* Content States */}
        {isLoading && <ClientGridSkeleton />}

        {isError && (
          <ClientErrorState
            error={error instanceof Error ? error.message : 'An error occurred'}
            onRetry={() => refetch()}
          />
        )}

        {/* No clients state (no search query) */}
        {showNoClients && <ClientEmptyState />}

        {/* Empty search results state */}
        {showSearchEmpty && (
          <ClientSearchEmpty
            query={searchQuery}
            onClearSearch={handleClearSearch}
          />
        )}

        {/* Filtered and sorted results */}
        {showResults && (
          <ClientGrid
            clients={filteredAndSortedClients}
            onEditClient={handleEditClient}
          />
        )}
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        client={selectedClient}
      />

      {/* Tier Limit Dialog */}
      <TierLimitDialog
        isOpen={isTierLimitDialogOpen}
        onClose={() => setIsTierLimitDialogOpen(false)}
        currentCount={clientCount}
        maxClients={maxClients}
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
