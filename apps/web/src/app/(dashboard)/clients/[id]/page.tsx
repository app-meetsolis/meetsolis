/**
 * Client Detail Page
 * Story 2.6: Client Detail View (Enhanced) - Task 2
 *
 * Main page for viewing client details with:
 * - 2-column responsive layout
 * - Client header with actions
 * - Tabbed interface (Overview, Meeting History, Notes)
 * - Action Items sidebar
 * - Next Steps section
 * - Edit/Delete functionality
 * - Loading and error states
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Client, ClientActionItem } from '@meetsolis/shared';
import { ClientDetailLayout } from '@/components/clients/ClientDetailLayout';
import { ClientDetailHeader } from '@/components/clients/ClientDetailHeader';
import { ClientTabs } from '@/components/clients/ClientTabs';
import { ClientOverview } from '@/components/clients/ClientOverview';
import { MeetingHistoryTabEmpty } from '@/components/clients/MeetingHistoryTabEmpty';
import { NotesTabPlaceholder } from '@/components/clients/NotesTabPlaceholder';
import { ClientActionItemsSidebar } from '@/components/clients/ClientActionItemsSidebar';
import { ClientNextSteps } from '@/components/clients/ClientNextSteps';
import { ClientModal } from '@/components/clients/ClientModal';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [actionItems, setActionItems] = useState<ClientActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch client data
  const fetchClient = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/clients/${clientId}`);

      if (response.status === 404) {
        setError('Client not found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }

      const data = await response.json();
      setClient(data);
    } catch (err) {
      console.error('Failed to fetch client:', err);
      setError('Failed to load client');
    }
  }, [clientId]);

  // Fetch action items
  const fetchActionItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/action-items?client_id=${clientId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch action items');
      }

      const data = await response.json();
      setActionItems(data.action_items || []);
    } catch (err) {
      console.error('Failed to fetch action items:', err);
      // Don't set error state for action items failure
    }
  }, [clientId]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchClient(), fetchActionItems()]);
      setIsLoading(false);
    };

    fetchData();
  }, [fetchClient, fetchActionItems]);

  // Handle edit client
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // Handle delete client
  const handleDelete = async () => {
    // This will be implemented in Task 15
    toast.error('Delete functionality will be implemented in Story 2.8');
  };

  // Handle client modal close (refetch to get updated data)
  const handleClientModalClose = () => {
    setIsEditModalOpen(false);
    // Refetch client data after modal closes (in case it was edited)
    fetchClient();
  };

  // Handle action items change
  const handleActionItemsChange = useCallback(async () => {
    await fetchActionItems();
  }, [fetchActionItems]);

  // Handle next steps change
  const handleNextStepsChange = async (steps: string[]) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/next-steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ next_steps: steps }),
      });

      if (!response.ok) {
        throw new Error('Failed to update next steps');
      }

      const data = await response.json();
      setClient(data.client);
    } catch (err) {
      console.error('Failed to update next steps:', err);
      throw err; // Re-throw so component can show error
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ClientDetailLoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ClientDetailErrorState error={error} onRetry={fetchClient} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <ClientDetailHeader
          client={client}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Main Layout: Tabs + Sidebar */}
        <ClientDetailLayout
          sidebar={
            <>
              {/* Action Items Sidebar */}
              <ClientActionItemsSidebar
                clientId={clientId}
                actionItems={actionItems}
                onActionItemsChange={handleActionItemsChange}
              />

              {/* Next Steps Section */}
              <ClientNextSteps
                clientId={clientId}
                nextSteps={client.next_steps || []}
                onNextStepsChange={handleNextStepsChange}
              />
            </>
          }
        >
          {/* Tabs */}
          <ClientTabs
            client={client}
            actionItems={actionItems}
            overviewTab={<ClientOverview client={client} />}
            meetingHistoryTab={<MeetingHistoryTabEmpty />}
            notesTab={<NotesTabPlaceholder />}
          />
        </ClientDetailLayout>
      </div>

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <ClientModal
          isOpen={isEditModalOpen}
          onClose={handleClientModalClose}
          mode="edit"
          client={client}
        />
      )}
    </div>
  );
}

/**
 * Loading Skeleton for Client Detail Page
 */
function ClientDetailLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Card className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Error State for Client Detail Page
 */
function ClientDetailErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {error || 'Something went wrong'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {error === 'Client not found'
              ? 'The client you are looking for does not exist or you do not have access to it.'
              : 'We encountered an error while loading the client details. Please try again.'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          {error !== 'Client not found' && (
            <Button onClick={onRetry}>Retry</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
