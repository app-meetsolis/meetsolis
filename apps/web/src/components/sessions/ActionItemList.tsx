'use client';

import { useState, KeyboardEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionItemRow } from '@/components/sessions/ActionItemRow';
import { ClientActionItem, ActionItemStatus } from '@meetsolis/shared';

interface ActionItemListProps {
  sessionId: string;
  clientId: string;
}

const SESSION_QUERY_KEY = (clientId: string, sessionId: string) =>
  ['action-items', clientId, 'session', sessionId] as const;
const CLIENT_QUERY_KEY = (clientId: string) =>
  ['action-items', clientId] as const;

async function fetchSessionActionItems(
  clientId: string,
  sessionId: string
): Promise<ClientActionItem[]> {
  const res = await fetch(
    `/api/action-items?client_id=${clientId}&session_id=${sessionId}`
  );
  if (!res.ok) throw new Error('Failed to fetch action items');
  const data = await res.json();
  return data.actionItems ?? [];
}

export function ActionItemList({ sessionId, clientId }: ActionItemListProps) {
  const queryClient = useQueryClient();
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState<'coach' | 'client'>('coach');
  const [isAdding, setIsAdding] = useState(false);

  const sessionKey = SESSION_QUERY_KEY(clientId, sessionId);
  const clientKey = CLIENT_QUERY_KEY(clientId);

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery<ClientActionItem[], Error>({
    queryKey: sessionKey,
    queryFn: () => fetchSessionActionItems(clientId, sessionId),
    staleTime: 60 * 1000,
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: sessionKey });
    queryClient.invalidateQueries({ queryKey: clientKey });
  }

  async function handleCheckboxChange(id: string, checked: boolean) {
    const newStatus: ActionItemStatus = checked ? 'completed' : 'pending';
    queryClient.setQueryData<ClientActionItem[]>(sessionKey, prev =>
      (prev ?? []).map(i =>
        i.id === id
          ? {
              ...i,
              status: newStatus,
              completed_at: checked ? new Date().toISOString() : null,
            }
          : i
      )
    );
    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          completed_at: checked ? new Date().toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      invalidateAll();
    } catch {
      toast.error('Failed to update action item');
      invalidateAll();
    }
  }

  async function handleStatusChange(id: string, status: ActionItemStatus) {
    queryClient.setQueryData<ClientActionItem[]>(sessionKey, prev =>
      (prev ?? []).map(i => (i.id === id ? { ...i, status } : i))
    );
    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      invalidateAll();
    } catch {
      toast.error('Failed to update status');
      invalidateAll();
    }
  }

  async function handleAdd() {
    const desc = newDesc.trim();
    if (!desc) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          description: desc,
          assignee: newAssignee,
          session_id: sessionId,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const newItem: ClientActionItem = await res.json();
      queryClient.setQueryData<ClientActionItem[]>(sessionKey, prev => [
        newItem,
        ...(prev ?? []),
      ]);
      toast.success('Action item added');
      setNewDesc('');
      invalidateAll();
    } catch {
      toast.error('Failed to add action item');
    } finally {
      setIsAdding(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Action Items
      </p>

      {isLoading && (
        <div className="space-y-1.5">
          {[1, 2].map(i => (
            <div key={i} className="h-7 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-xs text-red-500">Failed to load action items.</p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-xs text-muted-foreground">No action items yet.</p>
      )}

      {!isLoading &&
        !isError &&
        items.map(item => (
          <ActionItemRow
            key={item.id}
            item={item}
            onCheckboxChange={handleCheckboxChange}
            onStatusChange={handleStatusChange}
          />
        ))}

      {/* Inline add form */}
      <div className="mt-2 flex items-center gap-2">
        <Input
          placeholder="Add action item…"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAdding}
          className="h-7 flex-1 text-xs"
        />
        <Button
          size="sm"
          variant={newAssignee === 'coach' ? 'default' : 'outline'}
          className="h-7 px-2 text-xs"
          onClick={() => setNewAssignee('coach')}
          disabled={isAdding}
          type="button"
        >
          Coach
        </Button>
        <Button
          size="sm"
          variant={newAssignee === 'client' ? 'default' : 'outline'}
          className="h-7 px-2 text-xs"
          onClick={() => setNewAssignee('client')}
          disabled={isAdding}
          type="button"
        >
          Client
        </Button>
      </div>
    </div>
  );
}
