'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionItem } from '@meetsolis/shared';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ActionItemListProps {
  items: ActionItem[];
  sessionId: string;
  clientId: string;
  onUpdate?: () => void;
}

export function ActionItemList({
  items,
  sessionId,
  clientId,
  onUpdate,
}: ActionItemListProps) {
  const queryClient = useQueryClient();
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
      queryClient.invalidateQueries({ queryKey: ['action-items', clientId] });
      onUpdate?.();
    },
    onError: () => toast.error('Failed to update action item'),
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          client_id: clientId,
          text,
        }),
      });
      if (!res.ok) throw new Error('Failed to add');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items', clientId] });
      setNewItemText('');
      setIsAdding(false);
      onUpdate?.();
    },
    onError: () => toast.error('Failed to add action item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/action-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items', clientId] });
      onUpdate?.();
    },
    onError: () => toast.error('Failed to delete action item'),
  });

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          className="group flex items-start gap-3 rounded-md p-2 hover:bg-gray-50"
        >
          <Checkbox
            checked={item.completed}
            onCheckedChange={checked =>
              toggleMutation.mutate({ id: item.id, completed: !!checked })
            }
            className="mt-0.5"
          />
          <span
            className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}
          >
            {item.text}
          </span>
          <button
            onClick={() => deleteMutation.mutate(item.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
            aria-label="Delete action item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            placeholder="New action item..."
            className="h-8 text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' && newItemText.trim())
                addMutation.mutate(newItemText.trim());
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewItemText('');
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() =>
              newItemText.trim() && addMutation.mutate(newItemText.trim())
            }
            disabled={!newItemText.trim()}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAdding(false);
              setNewItemText('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-gray-500"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add action item
        </Button>
      )}
    </div>
  );
}
