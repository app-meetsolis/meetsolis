/**
 * ClientModal Component
 * Story 2.3: Add/Edit Client Modal - Task 1
 */

'use client';

import { useState, useEffect } from 'react';
import { Client } from '@meetsolis/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClientForm } from './ClientForm';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  client?: Client;
}

export function ClientModal({
  isOpen,
  onClose,
  mode,
  client,
}: ClientModalProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsDirty(false);
  }, [isOpen]);

  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSuccess = () => {
    setIsDirty(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-foreground">
            {mode === 'create' ? 'Add Client' : 'Edit Client'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === 'create'
              ? 'Form to add a new client to your account'
              : 'Form to edit existing client information'}
          </DialogDescription>
        </DialogHeader>

        <ClientForm
          mode={mode}
          client={client}
          onSuccess={handleSuccess}
          onCancel={handleClose}
          onDirtyChange={setIsDirty}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
