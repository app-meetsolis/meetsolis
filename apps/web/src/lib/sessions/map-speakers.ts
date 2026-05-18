/**
 * Speaker ID mapping (Story 6.3).
 *
 * Gladia returns 0-based speaker indices. Coaching sessions are coach + client,
 * so the lowest-index speaker is assumed to be the coach and the next the
 * client. >2 or 1 speaker is unexpected — flag it for coach review.
 *
 * Pure function — DB lookup of the client name happens in the caller.
 */

import type { DiarizedUtterance, SpeakerMap } from '@meetsolis/shared';
import { speakerKey } from '@meetsolis/shared';

export interface SpeakerMappingResult {
  speaker_map: SpeakerMap;
  speaker_review_needed: boolean;
  /** Dashboard note when something looks off (e.g. only one voice). null = clean. */
  note: string | null;
}

/** Distinct speaker indices present in the utterances, ascending. */
function distinctSpeakers(utterances: DiarizedUtterance[]): number[] {
  return Array.from(new Set(utterances.map(u => u.speaker))).sort(
    (a, b) => a - b
  );
}

/**
 * Map Gladia speaker indices to display names.
 *
 *  - 2 speakers  → speaker_0 "Coach", speaker_1 <client>. No review.
 *  - >2 speakers → extra speakers become "Unknown 1", "Unknown 2", … Review.
 *  - 1 speaker   → speaker_0 "Coach". Review (likely a recording issue).
 *  - 0 speakers  → empty map. Review.
 */
export function mapSpeakers(
  utterances: DiarizedUtterance[],
  clientName: string
): SpeakerMappingResult {
  const speakers = distinctSpeakers(utterances);
  const speaker_map: SpeakerMap = {};

  speakers.forEach((idx, position) => {
    if (position === 0) {
      speaker_map[speakerKey(idx)] = 'Coach';
    } else if (position === 1) {
      speaker_map[speakerKey(idx)] = clientName;
    } else {
      speaker_map[speakerKey(idx)] = `Unknown ${position - 1}`;
    }
  });

  if (speakers.length === 2) {
    return { speaker_map, speaker_review_needed: false, note: null };
  }

  if (speakers.length === 1) {
    return {
      speaker_map,
      speaker_review_needed: true,
      note: 'Only one voice detected — verify recording quality.',
    };
  }

  if (speakers.length === 0) {
    return {
      speaker_map,
      speaker_review_needed: true,
      note: 'No speech detected in the recording.',
    };
  }

  // >2 speakers
  return {
    speaker_map,
    speaker_review_needed: true,
    note: `${speakers.length} speakers detected — please verify the labels.`,
  };
}
