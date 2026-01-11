/**
 * Clients Dashboard Page
 * Story 2.2: Client Dashboard UI (Grid View)
 * Story 2.3: Add/Edit Client Modal - Task 8 (Integration)
 *
 * Displays all clients in a responsive grid layout with:
 * - 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
 * - Loading, empty, and error states
 * - Client cards with hover effects
 * - Add/Edit client modal integration
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientGrid } from '@/components/clients/ClientGrid';
import { ClientGridSkeleton } from '@/components/clients/ClientGridSkeleton';
import { ClientEmptyState } from '@/components/clients/ClientEmptyState';
import { ClientErrorState } from '@/components/clients/ClientErrorState';
import { ClientModal } from '@/components/clients/ClientModal';
import { TierLimitDialog } from '@/components/clients/TierLimitDialog';
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

export default function ClientsPage() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );
  const [isTierLimitDialogOpen, setIsTierLimitDialogOpen] = useState(false);

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
          <ClientGrid clients={clients} onEditClient={handleEditClient} />
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
