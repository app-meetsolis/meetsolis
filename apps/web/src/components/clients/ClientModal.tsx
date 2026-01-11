/**
 * ClientModal Component
 * Story 2.3: Add/Edit Client Modal - Task 1
 *
 * Modal for adding/editing clients with:
 * - Create/Edit modes
 * - Form validation
 * - Unsaved changes confirmation
 * - Auto-close on save
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

  // Reset dirty state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false);
    }
  }, [isOpen]);

  /**
   * Handle modal close with confirmation if unsaved changes
   */
  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  /**
   * Handle successful form submission
   */
  const handleSuccess = () => {
    setIsDirty(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1A1A]">
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
