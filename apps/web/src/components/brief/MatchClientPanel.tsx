/**
 * MatchClientPanel — shown when a brief's calendar event has no client (Story 6.4).
 * Matching the event to a client triggers brief generation.
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';

export interface MatchClientPanelProps {
  eventId: string;
  eventTitle: string;
  onMatched: () => void;
}

export function MatchClientPanel({
  eventId,
  eventTitle,
  onMatched,
}: MatchClientPanelProps) {
  const [clientId, setClientId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const r = await fetch('/api/clients');
      if (!r.ok) return [];
      return (await r.json()).clients ?? [];
    },
  });

  const handleSave = async () => {
    if (!clientId) return;
    setSaving(true);
    try {
      const matchRes = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      });
      if (!matchRes.ok) throw new Error('match failed');

      const genRes = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar_event_id: eventId }),
      });
      if (!genRes.ok) throw new Error('generate failed');

      onMatched();
    } catch {
      toast.error("Couldn't match this meeting. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Link2 className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-[18px] font-bold text-foreground">
        Match this meeting to a client
      </h1>
      <p className="mt-1.5 max-w-[340px] text-[13px] text-foreground/45">
        &ldquo;{eventTitle}&rdquo; isn&apos;t linked to a client yet. Pick one
        to generate the Coach Brief.
      </p>

      <div className="mt-6 flex w-full max-w-[320px] flex-col gap-3">
        <select
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          aria-label="Select client"
          className="h-10 rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select a client…</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button
          onClick={handleSave}
          disabled={!clientId || saving}
          className="gap-2 text-[13px] font-semibold"
        >
          {saving ? 'Generating brief…' : 'Match & generate brief'}
        </Button>
      </div>
    </div>
  );
}
