/**
 * Story 7.2 — AI Intelligence Strip on Client Card.
 *
 * Four rows: Recurring Theme, Recent Breakthrough, Current Focus, Coach Note.
 * AI-filled fields are click-to-edit. Coach Note is always editable, never
 * AI-touched. Refresh button is Pro-only (Free shows tooltip + upgrade).
 */

'use client';

import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';
import { Lock, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type {
  AIIntelligenceStrip as Strip,
  UsageResponse,
} from '@meetsolis/shared';

interface Props {
  clientId: string;
  strip: Strip | null;
  coachNotes: string;
  hasSessions: boolean;
}

function formatGeneratedAt(iso: string | undefined | null): string {
  if (!iso) return '';
  try {
    const date = parseISO(iso);
    const daysOld = differenceInDays(new Date(), date);
    if (daysOld <= 7) {
      return `Updated ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    return `Updated ${date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  } catch {
    return '';
  }
}

async function fetchUsage(): Promise<UsageResponse | null> {
  const r = await fetch('/api/usage');
  if (!r.ok) return null;
  return r.json();
}

export function AIIntelligenceStrip({
  clientId,
  strip,
  coachNotes,
  hasSessions,
}: Props) {
  const queryClient = useQueryClient();

  const { data: usage } = useQuery<UsageResponse | null>({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    staleTime: 5 * 60 * 1000,
  });
  const isPro = usage?.tier === 'pro';

  const refreshMutation = useMutation({
    mutationFn: async (opts?: { silent?: boolean }) => {
      const r = await fetch(`/api/clients/${clientId}/intelligence-strip`, {
        method: 'POST',
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Refresh failed');
      }
      const strip = (await r.json()).strip as Strip;
      return { strip, silent: opts?.silent ?? false };
    },
    onSuccess: data => {
      if (!data.silent) toast.success('Insights refreshed');
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (err: Error, vars) => {
      if (!vars?.silent) toast.error(err.message);
    },
  });

  // Auto-trigger first generation: client has sessions but never had a strip
  // generated (existing pre-7.2 clients OR session uploaded while page open).
  // Fires once per mount; server allows first-gen for both tiers.
  const autoFired = useRef(false);
  useEffect(() => {
    if (
      !strip &&
      hasSessions &&
      !autoFired.current &&
      !refreshMutation.isPending
    ) {
      autoFired.current = true;
      refreshMutation.mutate({ silent: true });
    }
  }, [strip, hasSessions, refreshMutation]);

  const updateStripMutation = useMutation({
    mutationFn: async (patch: Partial<Strip>) => {
      const r = await fetch(`/api/clients/${clientId}/intelligence-strip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Save failed');
      }
      return (await r.json()).strip as Strip;
    },
    onSuccess: () => {
      toast.success('Updated.');
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (coach_notes: string) => {
      const r = await fetch(`/api/clients/${clientId}/coach-notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_notes }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Save failed');
      }
      return (await r.json()).coach_notes as string;
    },
    onSuccess: () => {
      toast.success('Coach notes saved.');
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatedLabel = useMemo(
    () => formatGeneratedAt(strip?.generated_at),
    [strip?.generated_at]
  );

  if (!hasSessions) {
    return (
      <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
        <div className="flex items-center gap-2 text-foreground/50 text-[13px]">
          <Sparkles className="h-4 w-4 text-primary/70" />
          <span>
            Building your intelligence profile — add your first session to
            start.
          </span>
        </div>
      </div>
    );
  }

  if (!strip && refreshMutation.isError) {
    return (
      <div className="rounded-[12px] bg-card shadow-card px-6 py-5 space-y-3">
        <div className="flex items-center gap-2 text-foreground/55 text-[13px]">
          <Sparkles className="h-4 w-4 text-primary/70" />
          <span>
            Couldn&apos;t generate insights —{' '}
            {refreshMutation.error?.message ?? 'unknown error'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => refreshMutation.mutate(undefined)}
          className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    );
  }

  if (!strip || refreshMutation.isPending) {
    return (
      <div className="rounded-[12px] bg-card shadow-card px-6 py-5 space-y-3">
        <div className="skeleton rounded-md h-4 w-40" />
        <div className="skeleton rounded-md h-6 w-3/4" />
        <div className="skeleton rounded-md h-6 w-2/3" />
        <div className="skeleton rounded-md h-6 w-1/2" />
      </div>
    );
  }

  return (
    <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
            Intelligence
          </h2>
          {updatedLabel && (
            <span className="text-[11px] text-foreground/35 ml-2">
              {updatedLabel}
            </span>
          )}
        </div>
        <RefreshButton
          isPro={!!isPro}
          isPending={refreshMutation.isPending}
          onClick={() => refreshMutation.mutate(undefined)}
        />
      </header>

      <div className="space-y-4">
        <ThemeRow
          strip={strip}
          onSave={value =>
            updateStripMutation.mutate({ recurring_theme: value })
          }
        />
        <EditableStripField
          label="Recent breakthrough"
          value={strip.recent_breakthrough}
          onSave={value =>
            updateStripMutation.mutate({ recent_breakthrough: value })
          }
          isSaving={updateStripMutation.isPending}
        />
        <EditableStripField
          label="Current focus"
          value={strip.current_focus}
          onSave={value => updateStripMutation.mutate({ current_focus: value })}
          isSaving={updateStripMutation.isPending}
        />
        <CoachNotesField
          value={coachNotes}
          onSave={value => updateNotesMutation.mutate(value)}
          isSaving={updateNotesMutation.isPending}
        />
      </div>
    </div>
  );
}

function ThemeRow({
  strip,
  onSave,
}: {
  strip: Strip;
  onSave: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
        <span>Recurring theme</span>
        {strip.theme_frequency && (
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary normal-case tracking-normal">
            {strip.theme_frequency}
          </span>
        )}
      </div>
      <ClickToEdit
        value={strip.recurring_theme}
        onSave={onSave}
        ariaLabel="Recurring theme"
      />
    </div>
  );
}

function EditableStripField({
  label,
  value,
  onSave,
  isSaving,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  isSaving: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
        {label}
      </div>
      <ClickToEdit value={value} onSave={onSave} ariaLabel={label} />
      {isSaving && (
        <p className="text-[10px] text-foreground/30 mt-1">Saving…</p>
      )}
    </div>
  );
}

function CoachNotesField({
  value,
  onSave,
  isSaving,
}: {
  value: string;
  onSave: (value: string) => void;
  isSaving: boolean;
}) {
  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-3 w-3 text-foreground/40" />
        <span className="text-[11px] uppercase tracking-wider text-foreground/40">
          Coach note
        </span>
        <span className="text-[10px] text-foreground/30">
          Private — not shared with client
        </span>
      </div>
      <ClickToEdit
        value={value}
        onSave={onSave}
        multiline
        ariaLabel="Coach note"
        placeholder="Add a private note…"
      />
      {isSaving && (
        <p className="text-[10px] text-foreground/30 mt-1">Saving…</p>
      )}
    </div>
  );
}

function RefreshButton({
  isPro,
  isPending,
  onClick,
}: {
  isPro: boolean;
  isPending: boolean;
  onClick: () => void;
}) {
  if (!isPro) {
    return (
      <button
        type="button"
        title="Refresh insights manually — upgrade to Pro"
        disabled
        className="inline-flex items-center gap-1.5 text-[11px] text-foreground/30 cursor-not-allowed"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh insights
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-[11px] text-foreground/55 hover:text-foreground transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Refreshing…' : 'Refresh insights'}
    </button>
  );
}

function ClickToEdit({
  value,
  onSave,
  multiline,
  ariaLabel,
  placeholder,
}: {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  ariaLabel: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      try {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      } catch {
        // Some browsers throw on setSelectionRange for non-text inputs; ignore.
      }
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value.trim()) onSave(trimmed);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKey = (
    e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
  };

  if (!editing) {
    const trimmed = value?.trim() ?? '';
    const isPlaceholder = !trimmed;
    const isBuilding = trimmed === 'Building...';
    const display = isPlaceholder ? (placeholder ?? 'Click to add…') : value;
    const tone =
      isPlaceholder || isBuilding
        ? 'italic text-foreground/35'
        : 'text-foreground/85';
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${ariaLabel}`}
        className={`block w-full text-left text-[13px] leading-relaxed transition-colors py-1 px-2 -mx-2 rounded-md hover:text-foreground hover:ring-1 hover:ring-primary/20 hover:bg-primary/[0.03] ${tone}`}
      >
        {display}
      </button>
    );
  }

  const sharedProps = {
    ref: inputRef as never,
    value: draft,
    onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setDraft(e.target.value),
    onBlur: (_e: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      commit(),
    onKeyDown: handleKey,
    'aria-label': ariaLabel,
    className:
      'w-full bg-background border border-primary/30 rounded-md px-2 py-1 text-[13px] text-foreground focus:outline-none focus:border-primary',
  };

  if (multiline) {
    return <textarea {...sharedProps} rows={3} />;
  }
  return <input type="text" {...sharedProps} />;
}
