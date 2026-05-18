'use client';

/**
 * SpeakerMappingEditor (Story 6.3)
 * Lets a coach correct Gladia's speaker → name mapping for a bot session.
 * On confirm it PATCHes the new map; the server reformats the transcript and
 * re-runs the summary, which the session page picks up on its next poll.
 */

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SpeakerMap } from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SpeakerData {
  source: string;
  speaker_map: SpeakerMap | null;
  speaker_review_needed: boolean;
  review_note: string | null;
  client_name: string | null;
}

const CUSTOM = '__custom__';

async function fetchSpeakers(sessionId: string): Promise<SpeakerData> {
  const r = await fetch(`/api/recall/sessions/${sessionId}/speakers`);
  if (!r.ok) throw new Error('FETCH_ERROR');
  return r.json();
}

/** "speaker_0" → "Speaker 1" (1-based, human friendly). */
function speakerLabel(key: string): string {
  const n = Number(key.replace('speaker_', ''));
  return Number.isFinite(n) ? `Speaker ${n + 1}` : key;
}

export function SpeakerMappingEditor({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<SpeakerData>({
    queryKey: ['speakers', sessionId],
    queryFn: () => fetchSpeakers(sessionId),
  });

  const initialMap = data?.speaker_map ?? null;
  const [draft, setDraft] = useState<SpeakerMap | null>(null);

  // Preset name options offered in every dropdown.
  const presets = useMemo(() => {
    const names = ['Coach'];
    if (data?.client_name) names.push(data.client_name);
    names.push('Unknown 1', 'Unknown 2');
    return Array.from(new Set(names));
  }, [data?.client_name]);

  const mutation = useMutation({
    mutationFn: async (speakerMap: SpeakerMap) => {
      const r = await fetch(`/api/recall/sessions/${sessionId}/speakers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker_map: speakerMap }),
      });
      if (!r.ok) throw new Error('PATCH_ERROR');
      return r.json();
    },
    onSuccess: (_res, speakerMap) => {
      // Optimistic: keep the edited labels; flag review as resolved.
      queryClient.setQueryData<SpeakerData>(['speakers', sessionId], prev =>
        prev
          ? { ...prev, speaker_map: speakerMap, speaker_review_needed: false }
          : prev
      );
      // Session summary is regenerating server-side — let the page poll.
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      setDraft(null);
      toast.success('Speakers confirmed — regenerating summary…');
    },
    onError: () => toast.error('Could not update speakers. Please try again.'),
  });

  if (isLoading) {
    return <div className="skeleton h-24 w-full rounded-lg" />;
  }
  if (!initialMap || Object.keys(initialMap).length === 0) {
    return null; // not a diarized bot session
  }

  const current = draft ?? initialMap;
  const keys = Object.keys(current).sort();
  const dirty = draft !== null;
  const hasBlank = Object.values(current).some(v => !v.trim());

  const setName = (key: string, value: string) => {
    setDraft({ ...(draft ?? initialMap), [key]: value });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
        Speaker Labels
      </p>

      <div className="space-y-3">
        {keys.map(key => {
          const value = current[key];
          const isCustom = !presets.includes(value);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-[12px] text-muted-foreground">
                {speakerLabel(key)}
              </span>
              <Select
                value={isCustom ? CUSTOM : value}
                onValueChange={v => setName(key, v === CUSTOM ? '' : v)}
              >
                <SelectTrigger className="h-9 w-48 text-[13px]">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(p => (
                    <SelectItem key={p} value={p} className="text-[13px]">
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM} className="text-[13px]">
                    Custom…
                  </SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <Input
                  value={value}
                  onChange={e => setName(key, e.target.value)}
                  placeholder="Enter a name"
                  maxLength={80}
                  className="h-9 w-44 text-[13px]"
                />
              )}
            </div>
          );
        })}
      </div>

      {dirty && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            size="sm"
            disabled={hasBlank || mutation.isPending}
            onClick={() => mutation.mutate(current)}
          >
            {mutation.isPending ? 'Saving…' : 'Confirm speakers'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={() => setDraft(null)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
