'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ClientActionItem,
  ActionItemCreateSchema,
  ActionItemUpdateSchema,
} from '@meetsolis/shared';

interface ClientActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  item?: ClientActionItem | null;
  onSuccess: () => void;
}

type AssigneeType = 'coach' | 'client';

export function ClientActionItemModal({
  isOpen,
  onClose,
  clientId,
  item,
  onSuccess,
}: ClientActionItemModalProps) {
  const isEdit = !!item;
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<AssigneeType>('coach');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDescription(item?.description ?? '');
      setAssignee((item?.assignee as AssigneeType) ?? 'coach');
      setError(null);
    }
  }, [isOpen, item]);

  const isValid =
    description.trim().length > 0 && description.trim().length <= 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const descriptionTrimmed = description.trim();

    if (isEdit) {
      const validation = ActionItemUpdateSchema.safeParse({
        description: descriptionTrimmed,
        assignee,
      });
      if (!validation.success) {
        setError(validation.error.errors[0]?.message ?? 'Invalid input');
        return;
      }
    } else {
      const validation = ActionItemCreateSchema.safeParse({
        client_id: clientId,
        description: descriptionTrimmed,
        assignee,
      });
      if (!validation.success) {
        setError(validation.error.errors[0]?.message ?? 'Invalid input');
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/action-items/${item!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: descriptionTrimmed, assignee }),
        });
      } else {
        res = await fetch('/api/action-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            description: descriptionTrimmed,
            assignee,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? 'Failed to save');
      }

      toast.success(isEdit ? 'Action item updated' : 'Action item added');
      onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save action item';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !isSaving && !open && onClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit action item' : 'Add action item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What needs to be done?"
              className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              required
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/500
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Assigned to
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssignee('coach')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  assignee === 'coach'
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-border hover:bg-muted'
                }`}
              >
                Coach
              </button>
              <button
                type="button"
                onClick={() => setAssignee('client')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  assignee === 'client'
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-border hover:bg-muted'
                }`}
              >
                Client
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
