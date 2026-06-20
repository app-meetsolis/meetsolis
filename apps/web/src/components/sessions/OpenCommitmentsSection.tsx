/**
 * Story 7.6 — "Open Commitments from Past Sessions".
 *
 * Renders at the top of the session detail page, above the new summary, so the
 * coach sees the client's outstanding commitments before reading the session.
 * Excludes the current session; hidden entirely when nothing is open.
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { OpenActionItem } from '@meetsolis/shared';
import { OpenItemRow } from '@/components/action-items/OpenItemRow';
import { useCompleteOpenItem } from '@/hooks/useCompleteOpenItem';

interface Props {
  clientId: string;
  currentSessionId: string;
}

export function OpenCommitmentsSection({ clientId, currentSessionId }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['open-commitments', clientId, currentSessionId];

  const { data: items = [] } = useQuery<OpenActionItem[]>({
    queryKey,
    queryFn: async () => {
      const r = await fetch(
        `/api/action-items/open?client_id=${clientId}&exclude_session=${currentSessionId}`
      );
      if (!r.ok) return [];
      return (await r.json()).items ?? [];
    },
    staleTime: 30_000,
  });

  const { complete, completingId } = useCompleteOpenItem({
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (items.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg bg-card shadow-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
          Open Commitments from Past Sessions
        </h2>
        <span className="inline-flex items-center rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
          {items.length}
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map(item => (
          <OpenItemRow
            key={item.id}
            item={item}
            completing={completingId === item.id}
            onToggle={i => complete(i.id)}
          />
        ))}
      </ul>
    </div>
  );
}
