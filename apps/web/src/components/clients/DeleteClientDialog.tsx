/**
 * DeleteClientDialog Component
 * Story 2.8: Client Deletion & Cascading
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Client } from '@meetsolis/shared';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DeleteClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteClientDialog({
  client,
  isOpen,
  onClose,
}: DeleteClientDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmed(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!client || !confirmed) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error?.message || 'Failed to delete client');
      }
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
      onClose();
      router.push('/clients');
    } catch (err) {
      console.error('[DeleteClientDialog] delete error:', err);
      toast.error('Failed to delete client. Please try again.');
      setIsDeleting(false);
    }
  };

  // Reset confirmed when dialog opens for a new client
  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
    else setConfirmed(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">Delete Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-[#6B7280]">
            Delete{' '}
            <span className="font-semibold text-[#1A1A1A]">{client?.name}</span>
            ? This will permanently delete all sessions, action items, and Solis
            query history for this client.{' '}
            <span className="font-medium text-red-600">
              This cannot be undone.
            </span>
          </p>

          <div className="flex items-center gap-3 rounded-md border border-red-100 bg-red-50 p-3">
            <Checkbox
              id="confirm-delete"
              checked={confirmed}
              onCheckedChange={val => setConfirmed(!!val)}
              disabled={isDeleting}
              className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
            />
            <Label
              htmlFor="confirm-delete"
              className="cursor-pointer text-sm text-[#374151]"
            >
              I understand this is permanent
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!confirmed || isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
