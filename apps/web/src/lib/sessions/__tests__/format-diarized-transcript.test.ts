/**
 * Unit tests — diarized transcript formatter (Story 6.3)
 */

import { formatDiarizedTranscript } from '../format-diarized-transcript';
import type { DiarizedUtterance, SpeakerMap } from '@meetsolis/shared';

const MAP: SpeakerMap = { speaker_0: 'Coach', speaker_1: 'Sarah Chen' };

function utt(speaker: number, text: string, start: number): DiarizedUtterance {
  return { speaker, text, start, end: start + 1 };
}

describe('formatDiarizedTranscript', () => {
  it('produces "[Name]: text" lines using the speaker map', () => {
    const text = formatDiarizedTranscript(
      [utt(0, 'Welcome back.', 0), utt(1, 'Thanks.', 2)],
      MAP
    );
    expect(text).toBe('[Coach]: Welcome back.\n[Sarah Chen]: Thanks.');
  });

  it('groups consecutive utterances from the same speaker into one line', () => {
    const text = formatDiarizedTranscript(
      [
        utt(0, 'Welcome back.', 0),
        utt(0, 'How was the week?', 1),
        utt(1, 'Good.', 2),
      ],
      MAP
    );
    expect(text).toBe(
      '[Coach]: Welcome back. How was the week?\n[Sarah Chen]: Good.'
    );
  });

  it('falls back to "Speaker N" when a speaker is not mapped', () => {
    const text = formatDiarizedTranscript([utt(2, 'Who am I?', 0)], MAP);
    expect(text).toBe('[Speaker 2]: Who am I?');
  });

  it('sorts utterances by start time', () => {
    const text = formatDiarizedTranscript(
      [utt(1, 'second', 5), utt(0, 'first', 0)],
      MAP
    );
    expect(text).toBe('[Coach]: first\n[Sarah Chen]: second');
  });

  it('skips blank utterances', () => {
    const text = formatDiarizedTranscript(
      [utt(0, '  ', 0), utt(1, 'real text', 1)],
      MAP
    );
    expect(text).toBe('[Sarah Chen]: real text');
  });

  it('returns an empty string for no utterances', () => {
    expect(formatDiarizedTranscript([], MAP)).toBe('');
  });
});
