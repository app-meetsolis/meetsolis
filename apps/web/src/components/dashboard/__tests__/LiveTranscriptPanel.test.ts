/**
 * Pure-helper tests for LiveTranscriptPanel (Story 6.5).
 * Covers speaker-map render-time mapping + ms→clock formatting.
 */

import { __test_only } from '../LiveTranscriptPanel';
import type { TranscriptChunk } from '@meetsolis/shared';

const { labelForSpeaker, msToClock } = __test_only;

function chunk(over: Partial<TranscriptChunk>): TranscriptChunk {
  return {
    speaker: 0,
    speaker_name: null,
    text: 'hello',
    start_ms: 0,
    end_ms: 1000,
    ...over,
  };
}

describe('labelForSpeaker', () => {
  it('uses speaker_map when populated', () => {
    expect(
      labelForSpeaker(chunk({ speaker: 1 }), {
        speaker_0: 'Coach',
        speaker_1: 'Sarah Chen',
      })
    ).toBe('Sarah Chen');
  });

  it('falls back to chunk.speaker_name when no map', () => {
    expect(
      labelForSpeaker(chunk({ speaker: 0, speaker_name: 'Alice' }), null)
    ).toBe('Alice');
  });

  it('falls back to "Speaker N" when neither map nor name', () => {
    expect(labelForSpeaker(chunk({ speaker: 2 }), null)).toBe('Speaker 2');
  });

  it('prefers speaker_map over speaker_name', () => {
    expect(
      labelForSpeaker(chunk({ speaker: 0, speaker_name: 'fallback' }), {
        speaker_0: 'Coach',
      })
    ).toBe('Coach');
  });

  it('falls back when speaker not in map', () => {
    expect(
      labelForSpeaker(chunk({ speaker: 3, speaker_name: 'Bob' }), {
        speaker_0: 'Coach',
      })
    ).toBe('Bob');
  });
});

describe('msToClock', () => {
  it('formats sub-minute correctly', () => {
    expect(msToClock(12_500)).toBe('00:12');
  });
  it('formats minute-padded', () => {
    expect(msToClock(72_000)).toBe('01:12');
  });
  it('formats zero', () => {
    expect(msToClock(0)).toBe('00:00');
  });
});
