/**
 * ClientActionItemsSidebar Component
 * Story 2.6: Client Detail View (Enhanced) - Task 8
 *
 * Sidebar displaying action items for a client:
 * - Header with count badge
 * - List of action items (ActionItemCard)
 * - "+ Add Action Item" button
 * - Empty state
 * - Scrollable if >5 items
 * - Accessibility (role, aria-label)
 * - Optimistic updates
 */

'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientActionItem } from '@meetsolis/shared';
import { ActionItemCard } from './ActionItemCard';
import { ClientActionItemModal } from './ClientActionItemModal';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClientActionItemsSidebarProps {
  clientId: string;
  actionItems: ClientActionItem[];
  onActionItemsChange: () => void;
}

export function ClientActionItemsSidebar({
  clientId,
  actionItems: initialActionItems,
  onActionItemsChange,
}: ClientActionItemsSidebarProps) {
  const [actionItems, setActionItems] =
    useState<ClientActionItem[]>(initialActionItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientActionItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toggle action item completed status
  const handleToggle = useCallback(
    async (id: string) => {
      // Optimistic update
      setActionItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );

      try {
        const item = actionItems.find(i => i.id === id);
        if (!item) return;

        const response = await fetch(`/api/action-items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completed: !item.completed,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update action item');
        }

        onActionItemsChange();
      } catch (error) {
        // Revert optimistic update on error
        setActionItems(prev =>
          prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
          )
        );
        console.error('Failed to toggle action item:', error);
        toast.error('Failed to update action item');
      }
    },
    [actionItems, onActionItemsChange]
  );

  // Open modal to create new action item
  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing action item
  const handleEdit = (item: ClientActionItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Delete action item
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/action-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete action item');
      }

      toast.success('Action item deleted successfully');
      onActionItemsChange();
    } catch (error) {
      console.error('Failed to delete action item:', error);
      toast.error('Failed to delete action item');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    onActionItemsChange();
  };

  return (
    <>
      <Card
        className="p-6"
        role="region"
        aria-label="Action items for this client"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Action Items
            {actionItems.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {actionItems.length}
              </Badge>
            )}
          </h2>
        </div>

        {/* Action Items List */}
        {actionItems.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4 pr-1">
            {actionItems.map(item => (
              <ActionItemCard
                key={item.id}
                actionItem={item}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={id => setDeleteConfirmId(id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No action items yet</p>
        )}

        {/* Add Button */}
        <Button
          onClick={handleAdd}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Action Item
        </Button>
      </Card>

      {/* Create/Edit Modal */}
      <ClientActionItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        clientId={clientId}
        actionItem={editingItem}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Action Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this action item? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
