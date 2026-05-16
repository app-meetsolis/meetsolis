'use client';

/**
 * ActionItemsAutoToggle (Story 6.2c)
 * Global on/off for auto-generating action items after every meeting summary.
 * Default OFF. Self-contained — reads/writes /api/user/preferences itself,
 * so it can be relocated by the upcoming client-page redesign untouched.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface PreferencesResponse {
  auto_action_items_enabled: boolean;
}

const QUERY_KEY = ['user-preferences'];

export function ActionItemsAutoToggle() {
  const queryClient = useQueryClient();

  const { data } = useQuery<PreferencesResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const r = await fetch('/api/user/preferences');
      if (!r.ok) throw new Error('FETCH_ERROR');
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const enabled = data?.auto_action_items_enabled ?? false;

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const r = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_action_items_enabled: next }),
      });
      if (!r.ok) throw new Error('Failed to save preference');
      return next;
    },
    onSuccess: next => {
      queryClient.setQueryData<PreferencesResponse>(QUERY_KEY, prev => ({
        ...(prev ?? { auto_action_items_enabled: false }),
        auto_action_items_enabled: next,
      }));
      toast.success(
        next
          ? 'Action items will auto-generate after each session'
          : 'Auto-generation turned off'
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <label
      className="flex items-center gap-2 cursor-pointer select-none"
      title="When on, action items generate automatically after every meeting summary"
    >
      <span className="text-[11px] font-medium text-foreground/45">
        Auto-generate
      </span>
      <Switch
        checked={enabled}
        disabled={mutation.isPending}
        onCheckedChange={next => mutation.mutate(next)}
        aria-label="Auto-generate action items"
      />
    </label>
  );
}
