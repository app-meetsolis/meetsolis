'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ActionItemCard } from '@/components/clients/ActionItemCard';
import { ClientActionItemModal } from '@/components/clients/ClientActionItemModal';
import { ClientActionItem } from '@meetsolis/shared';

interface PendingActionsSectionProps {
  clientId: string;
}

async function fetchPendingActionItems(
  clientId: string
): Promise<ClientActionItem[]> {
  const res = await fetch(
    `/api/action-items?client_id=${clientId}&status=pending`
  );
  if (!res.ok) throw new Error('Failed to fetch action items');
  const data = await res.json();
  return data.actionItems ?? [];
}

export function PendingActionsSection({
  clientId,
}: PendingActionsSectionProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientActionItem | null>(null);

  const {
    data: actionItems = [],
    isLoading,
    isError,
  } = useQuery<ClientActionItem[], Error>({
    queryKey: ['action-items', clientId],
    queryFn: () => fetchPendingActionItems(clientId),
    staleTime: 60 * 1000,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['action-items', clientId] });
  }

  async function handleComplete(id: string) {
    // Optimistic update
    queryClient.setQueryData<ClientActionItem[]>(
      ['action-items', clientId],
      prev => (prev ?? []).filter(item => item.id !== id)
    );

    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) throw new Error('Failed to complete');
      toast.success('Action item completed');
    } catch {
      toast.error('Failed to complete action item');
      invalidate(); // revert
    }
  }

  async function handleDelete(id: string) {
    // Optimistic update
    queryClient.setQueryData<ClientActionItem[]>(
      ['action-items', clientId],
      prev => (prev ?? []).filter(item => item.id !== id)
    );

    try {
      const res = await fetch(`/api/action-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Action item deleted');
    } catch {
      toast.error('Failed to delete action item');
      invalidate(); // revert
    }
  }

  function handleEdit(item: ClientActionItem) {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  function handleAdd() {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Pending Actions
          </h2>
          {actionItems.length > 0 && (
            <span className="rounded-full bg-[#E8E4DD] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
              {actionItems.length}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add item
        </Button>
      </div>

      {/* Content */}
      <div className="p-2">
        {isLoading && (
          <div className="space-y-2 px-2 py-3">
            {[1, 2].map(i => (
              <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        )}

        {isError && (
          <p className="px-3 py-4 text-sm text-red-500">
            Failed to load action items.
          </p>
        )}

        {!isLoading && !isError && actionItems.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-[#9CA3AF]">
            No pending actions — great work!
          </p>
        )}

        {!isLoading &&
          !isError &&
          actionItems.map(item => (
            <ActionItemCard
              key={item.id}
              item={item}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <ClientActionItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        clientId={clientId}
        item={editingItem}
        onSuccess={invalidate}
      />
    </section>
  );
}
