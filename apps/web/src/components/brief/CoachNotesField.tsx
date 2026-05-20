/**
 * CoachNotesField — private "Open Questions" notes (Story 6.4).
 * Persists to clients.coach_notes (NOT the brief) — survives across sessions.
 * Autosaves on blur. Never AI-touched.
 */

'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export interface CoachNotesFieldProps {
  clientId: string;
  initialValue: string;
}

export function CoachNotesField({
  clientId,
  initialValue,
}: CoachNotesFieldProps) {
  const [value, setValue] = useState(initialValue);
  const savedRef = useRef(initialValue);

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (notes: string) => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_notes: notes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
    },
    onSuccess: (_d, notes) => {
      savedRef.current = notes;
    },
    onError: () => toast.error("Couldn't save your notes."),
  });

  const handleBlur = () => {
    if (value !== savedRef.current) mutation.mutate(value);
  };

  return (
    <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-foreground/35" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
          Open Questions
        </h2>
        <span className="text-[10px] text-foreground/30">
          · private, persists across sessions
        </span>
      </div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Your notes for this client…"
        rows={3}
        aria-label="Private coach notes"
        className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <p className="mt-1 h-3 text-[10px] text-foreground/30">
        {mutation.isPending
          ? 'Saving…'
          : value !== savedRef.current
            ? ''
            : 'Saved'}
      </p>
    </section>
  );
}
