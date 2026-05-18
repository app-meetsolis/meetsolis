/**
 * Unit tests — speaker ID mapping (Story 6.3)
 */

import { mapSpeakers } from '../map-speakers';
import type { DiarizedUtterance } from '@meetsolis/shared';

function utt(speaker: number, text = 'hello'): DiarizedUtterance {
  return { speaker, text, start: speaker, end: speaker + 1 };
}

describe('mapSpeakers', () => {
  it('Case A — exactly 2 speakers: coach + client, no review', () => {
    const result = mapSpeakers([utt(0), utt(1), utt(0)], 'Sarah Chen');
    expect(result.speaker_map).toEqual({
      speaker_0: 'Coach',
      speaker_1: 'Sarah Chen',
    });
    expect(result.speaker_review_needed).toBe(false);
    expect(result.note).toBeNull();
  });

  it('Case B — >2 speakers: extras become "Unknown N", review needed', () => {
    const result = mapSpeakers([utt(0), utt(1), utt(2), utt(3)], 'Sarah Chen');
    expect(result.speaker_map).toEqual({
      speaker_0: 'Coach',
      speaker_1: 'Sarah Chen',
      speaker_2: 'Unknown 1',
      speaker_3: 'Unknown 2',
    });
    expect(result.speaker_review_needed).toBe(true);
    expect(result.note).toContain('4 speakers');
  });

  it('Case C — 1 speaker: coach only, review needed', () => {
    const result = mapSpeakers([utt(0), utt(0)], 'Sarah Chen');
    expect(result.speaker_map).toEqual({ speaker_0: 'Coach' });
    expect(result.speaker_review_needed).toBe(true);
    expect(result.note).toContain('one voice');
  });

  it('0 speakers — empty map, review needed', () => {
    const result = mapSpeakers([], 'Sarah Chen');
    expect(result.speaker_map).toEqual({});
    expect(result.speaker_review_needed).toBe(true);
    expect(result.note).toContain('No speech');
  });

  it('assigns roles by position when speaker indices are non-contiguous', () => {
    const result = mapSpeakers([utt(0), utt(2)], 'Sarah Chen');
    expect(result.speaker_map).toEqual({
      speaker_0: 'Coach',
      speaker_2: 'Sarah Chen',
    });
    expect(result.speaker_review_needed).toBe(false);
  });
});
