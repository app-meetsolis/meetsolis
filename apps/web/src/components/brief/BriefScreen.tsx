/**
 * BriefScreen — Coach Brief screen orchestrator (Story 6.4).
 * Fetches the brief view, resolves its state, and wires inline edits,
 * action-item toggles, dismissal, and regeneration.
 */

'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import type {
  CoachBrief,
  CoachBriefContent,
  BriefBreakthrough,
  BriefEvent,
} from '@meetsolis/shared';
import { BriefHeader } from './BriefHeader';
import { LastSessionPanel } from './LastSessionPanel';
import { AIPrepNote } from './AIPrepNote';
import { BreakthroughsPanel } from './BreakthroughsPanel';
import { CoachNotesField } from './CoachNotesField';
import { MatchClientPanel } from './MatchClientPanel';
import { BriefUpgradePrompt } from './BriefUpgradePrompt';
import { BriefSkeleton } from './BriefSkeleton';

type BriefState =
  | 'ready'
  | 'generating'
  | 'unmatched'
  | 'upgrade_required'
  | 'not_found';

interface BriefView {
  state: BriefState;
  tier?: string;
  brief?: CoachBrief;
  event?: BriefEvent | null;
  client_id?: string;
  sibling_event_ids?: string[];
}

export interface BriefScreenProps {
  eventId?: string;
  clientId?: string;
}

export function BriefScreen({ eventId, clientId }: BriefScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['brief', eventId ?? `client:${clientId}`];

  const { data, isLoading, refetch } = useQuery<BriefView>({
    queryKey,
    queryFn: async () => {
      const qs = eventId ? `event_id=${eventId}` : `client_id=${clientId}`;
      const res = await fetch(`/api/brief?${qs}`);
      return res.json();
    },
  });

  // --- Generate / regenerate -------------------------------------------
  const generateMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const body = eventId
        ? { calendar_event_id: eventId }
        : { client_id: clientId };
      const res = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('generate failed');
    },
    onSuccess: () => refetch(),
    onError: () => toast.error('Brief generation failed. Please retry.'),
  });

  // Auto-generate once when the brief does not exist yet
  useEffect(() => {
    if (data?.state === 'generating' && generateMutation.isIdle) {
      generateMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.state]);

  const brief = data?.brief;

  // --- Inline edits (PATCH) --------------------------------------------
  const patchMutation = useMutation<CoachBrief, Error, Record<string, unknown>>(
    {
      mutationFn: async patch => {
        const res = await fetch(`/api/brief/${brief!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('patch failed');
        return (await res.json()).brief;
      },
      onSuccess: updated => {
        queryClient.setQueryData<BriefView>(queryKey, old =>
          old ? { ...old, brief: updated } : old
        );
      },
      onError: () => toast.error("Couldn't save your edit."),
    }
  );

  // --- Action-item toggle ----------------------------------------------
  const toggleMutation = useMutation<
    void,
    Error,
    { id: string; current: 'open' | 'done' }
  >({
    mutationFn: async ({ id, current }) => {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: current === 'done' ? 'pending' : 'completed',
        }),
      });
      if (!res.ok) throw new Error('toggle failed');
    },
    onMutate: ({ id, current }) => {
      queryClient.setQueryData<BriefView>(queryKey, old => {
        if (!old?.brief?.content.last_session) return old;
        const ls = old.brief.content.last_session;
        return {
          ...old,
          brief: {
            ...old.brief,
            content: {
              ...old.brief.content,
              last_session: {
                ...ls,
                action_items: ls.action_items.map(a =>
                  a.id === id
                    ? { ...a, status: current === 'done' ? 'open' : 'done' }
                    : a
                ),
              },
            },
          },
        };
      });
    },
    onError: () => {
      toast.error("Couldn't update that action item.");
      refetch();
    },
  });

  // --- Dismiss ----------------------------------------------------------
  const dismissMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/brief/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief_id: brief!.id }),
      });
      if (!res.ok) throw new Error('dismiss failed');
    },
    onSuccess: () => router.push('/dashboard'),
    onError: () => toast.error("Couldn't dismiss this brief."),
  });

  // --- Render -----------------------------------------------------------
  if (isLoading || !data) return <BriefSkeleton />;

  if (data.state === 'upgrade_required') return <BriefUpgradePrompt />;

  if (data.state === 'not_found') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-[18px] font-bold text-foreground">
          Brief not found
        </h1>
        <p className="mt-1.5 text-[13px] text-foreground/45">
          This meeting may have been removed.
        </p>
      </div>
    );
  }

  if (data.state === 'unmatched' && data.event) {
    return (
      <MatchClientPanel
        eventId={data.event.id}
        eventTitle={data.event.title}
        onMatched={() => refetch()}
      />
    );
  }

  if (data.state === 'generating' || !brief) {
    return (
      <BriefSkeleton
        label={
          generateMutation.isError
            ? 'Generation failed — retrying may help.'
            : 'Preparing your Coach Brief…'
        }
      />
    );
  }

  const content: CoachBriefContent = brief.content;
  const edited = new Set(content.edited_fields ?? []);
  const nextEventId = data.sibling_event_ids?.[0] ?? null;

  return (
    <>
      <Toaster position="top-right" duration={3000} />
      <div className="mx-auto w-full max-w-2xl px-6 py-7">
        <BriefHeader
          clientName={content.client_name}
          startTime={data.event?.start_time ?? null}
          nextEventId={nextEventId}
          onNext={() => nextEventId && router.push(`/brief/${nextEventId}`)}
          onDismiss={() => dismissMutation.mutate()}
          dismissing={dismissMutation.isPending}
        />

        <div className="mt-5 space-y-4">
          <LastSessionPanel
            lastSession={content.last_session}
            isFirstSession={content.is_first_session}
            clientName={content.client_name}
            keyThemeEdited={edited.has('key_theme')}
            onToggleActionItem={(id, current) =>
              toggleMutation.mutate({ id, current })
            }
            onSaveKeyTheme={theme => patchMutation.mutate({ key_theme: theme })}
          />

          <AIPrepNote
            note={content.ai_prep_note}
            edited={edited.has('ai_prep_note')}
            failed={brief.generation_status === 'ai_failed'}
            onSave={note => patchMutation.mutate({ ai_prep_note: note })}
            onRetry={() => generateMutation.mutate()}
            retrying={generateMutation.isPending}
          />

          <BreakthroughsPanel
            isFirstSession={content.is_first_session}
            breakthroughs={content.past_breakthroughs}
            suggestedQuestions={content.suggested_questions}
            breakthroughsEdited={edited.has('breakthroughs')}
            questionsEdited={edited.has('suggested_questions')}
            onSaveBreakthroughs={(b: BriefBreakthrough[]) =>
              patchMutation.mutate({ breakthroughs: b })
            }
            onSaveQuestions={q =>
              patchMutation.mutate({ suggested_questions: q })
            }
          />

          <CoachNotesField
            clientId={brief.client_id}
            initialValue={content.coach_open_questions}
          />
        </div>
      </div>
    </>
  );
}
