'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            {isEdit ? 'Edit action item' : 'Add action item'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#6B7280] hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Description */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What needs to be done?"
              className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#001F3F] focus:outline-none focus:ring-1 focus:ring-[#001F3F]"
              required
            />
            <p className="mt-1 text-right text-xs text-[#9CA3AF]">
              {description.length}/500
            </p>
          </div>

          {/* Assigned To */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
              Assigned to
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssignee('coach')}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  assignee === 'coach'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-[#6B7280] hover:border-gray-300'
                }`}
              >
                Coach
              </button>
              <button
                type="button"
                onClick={() => setAssignee('client')}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  assignee === 'client'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-[#6B7280] hover:border-gray-300'
                }`}
              >
                Client
              </button>
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2">
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
      </div>
    </div>
  );
}
