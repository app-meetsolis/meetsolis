/**
 * Diarized transcript formatter (Story 6.3).
 *
 * Turns Gladia utterances + a speaker map into the plain-text transcript
 * stored on sessions.transcript_text and fed to the summary pipeline:
 *
 *   [Coach]: Welcome back, Sarah. How did the week go?
 *   [Sarah Chen]: Honestly, a lot better than I expected...
 *
 * Consecutive utterances from the same speaker are merged into one line so
 * the summarizer sees natural turn-taking rather than fragmented chunks.
 */

import type { DiarizedUtterance, SpeakerMap } from '@meetsolis/shared';
import { speakerKey } from '@meetsolis/shared';

/** Display label for a speaker index — mapped name, else "Speaker N". */
function label(speaker: number, speakerMap: SpeakerMap): string {
  return speakerMap[speakerKey(speaker)] ?? `Speaker ${speaker}`;
}

export function formatDiarizedTranscript(
  utterances: DiarizedUtterance[],
  speakerMap: SpeakerMap
): string {
  if (utterances.length === 0) return '';

  // Gladia returns utterances in order, but sort defensively on start time.
  const sorted = [...utterances].sort((a, b) => a.start - b.start);

  const lines: string[] = [];
  let currentSpeaker: number | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentSpeaker === null || buffer.length === 0) return;
    lines.push(`[${label(currentSpeaker, speakerMap)}]: ${buffer.join(' ')}`);
    buffer = [];
  };

  for (const u of sorted) {
    const text = u.text.trim();
    if (!text) continue;
    if (u.speaker !== currentSpeaker) {
      flush();
      currentSpeaker = u.speaker;
    }
    buffer.push(text);
  }
  flush();

  return lines.join('\n');
}
