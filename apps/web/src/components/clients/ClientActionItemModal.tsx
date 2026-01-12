/**
 * ClientActionItemModal Component
 * Story 2.6: Client Detail View (Enhanced) - Task 10
 *
 * Modal for creating and editing action items:
 * - Description field (required, max 500 chars)
 * - Due date picker (optional)
 * - Form validation with Zod
 * - Create/Update API calls
 * - Success/error toasts
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientActionItem } from '@meetsolis/shared';
import { toast } from 'sonner';

// Form schema
const actionItemFormSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  due_date: z.string().optional(),
});

type ActionItemFormData = z.infer<typeof actionItemFormSchema>;

interface ClientActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  actionItem?: ClientActionItem | null;
  onSuccess: () => void;
}

export function ClientActionItemModal({
  isOpen,
  onClose,
  clientId,
  actionItem,
  onSuccess,
}: ClientActionItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!actionItem;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActionItemFormData>({
    resolver: zodResolver(actionItemFormSchema),
    defaultValues: {
      description: actionItem?.description || '',
      due_date: actionItem?.due_date || '',
    },
  });

  // Reset form when modal opens/closes or actionItem changes
  useEffect(() => {
    if (isOpen) {
      reset({
        description: actionItem?.description || '',
        due_date: actionItem?.due_date || '',
      });
    }
  }, [isOpen, actionItem, reset]);

  const onSubmit = async (data: ActionItemFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && actionItem) {
        // Update existing action item
        const response = await fetch(`/api/action-items/${actionItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: data.description,
            due_date: data.due_date || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update action item');
        }

        toast.success('Action item updated successfully');
      } else {
        // Create new action item
        const response = await fetch('/api/action-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            description: data.description,
            due_date: data.due_date || null,
            completed: false,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create action item');
        }

        toast.success('Action item created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Action item operation failed:', error);
      toast.error(
        isEditMode
          ? 'Failed to update action item'
          : 'Failed to create action item'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Action Item' : 'Add Action Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the action item details below.'
              : 'Create a new action item for this client.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter action item description..."
              {...register('description')}
              maxLength={500}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Due Date Field */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (optional)</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              className={errors.due_date ? 'border-red-500' : ''}
            />
            {errors.due_date && (
              <p className="text-sm text-red-500">{errors.due_date.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
