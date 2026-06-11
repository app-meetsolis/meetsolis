/**
 * Story 7.2 — AI Intelligence Strip on Client Card.
 *
 * Four rows: Recurring Theme, Recent Breakthrough, Current Focus, Coach Note.
 * AI-filled fields are click-to-edit. Coach Note is always editable, never
 * AI-touched. Refresh button is Pro-only (Free shows tooltip + upgrade).
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';
import { Lock, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type {
  AIIntelligenceStrip as Strip,
  AIIntelligenceStripOverrides,
  StripField,
  UsageResponse,
} from '@meetsolis/shared';
import { ClickToEdit } from './ClickToEdit';
import { RowIndicators } from './strip/RowIndicators';
import { RefreshButton } from './strip/RefreshButton';

interface Props {
  clientId: string;
  strip: Strip | null;
  coachNotes: string;
  hasSessions: boolean;
  /** Story 7.7 — per-field coach override flags. Missing = treated as {}. */
  overrides?: AIIntelligenceStripOverrides;
}

interface StripPatch {
  recurring_theme?: string;
  recent_breakthrough?: string;
  current_focus?: string;
  clear_overrides?: StripField[];
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
  overrides = {},
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
    mutationFn: async (patch: StripPatch) => {
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
    onSuccess: (_data, vars) => {
      const wasClear = (vars.clear_overrides?.length ?? 0) > 0;
      toast.success(
        wasClear
          ? 'Reset — AI will rewrite after the next session.'
          : 'Updated.'
      );
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const clearOverride = (field: StripField) =>
    updateStripMutation.mutate({ clear_overrides: [field] });

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
          isOverridden={overrides.recurring_theme === true}
          onSave={value =>
            updateStripMutation.mutate({ recurring_theme: value })
          }
          onClearOverride={() => clearOverride('recurring_theme')}
        />
        <EditableStripField
          label="Recent breakthrough"
          value={strip.recent_breakthrough}
          isOverridden={overrides.recent_breakthrough === true}
          onSave={value =>
            updateStripMutation.mutate({ recent_breakthrough: value })
          }
          onClearOverride={() => clearOverride('recent_breakthrough')}
          isSaving={updateStripMutation.isPending}
        />
        <EditableStripField
          label="Current focus"
          value={strip.current_focus}
          isOverridden={overrides.current_focus === true}
          onSave={value => updateStripMutation.mutate({ current_focus: value })}
          onClearOverride={() => clearOverride('current_focus')}
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
  isOverridden,
  onSave,
  onClearOverride,
}: {
  strip: Strip;
  isOverridden: boolean;
  onSave: (value: string) => void;
  onClearOverride: () => void;
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
        <RowIndicators
          isOverridden={isOverridden}
          onClearOverride={onClearOverride}
        />
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
  isOverridden,
  onSave,
  onClearOverride,
  isSaving,
}: {
  label: string;
  value: string;
  isOverridden: boolean;
  onSave: (value: string) => void;
  onClearOverride: () => void;
  isSaving: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
        <span>{label}</span>
        <RowIndicators
          isOverridden={isOverridden}
          onClearOverride={onClearOverride}
        />
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
