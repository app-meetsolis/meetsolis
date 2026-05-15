/**
 * Unit tests — streaming transcript chunk processing (Story 6.2b)
 */

import {
  normalizeChunks,
  concatTranscriptText,
  speakerLabel,
  appendTranscriptChunk,
} from '../process-transcript-chunk';
import type { TranscriptChunk } from '@meetsolis/shared';

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

describe('normalizeChunks', () => {
  it('sorts chunks by start_ms', () => {
    const out = normalizeChunks([
      chunk({ start_ms: 3000, text: 'c' }),
      chunk({ start_ms: 1000, text: 'a' }),
      chunk({ start_ms: 2000, text: 'b' }),
    ]);
    expect(out.map(c => c.text)).toEqual(['a', 'b', 'c']);
  });

  it('drops duplicate finals (same start_ms + speaker)', () => {
    const out = normalizeChunks([
      chunk({ start_ms: 1000, speaker: 0, text: 'first' }),
      chunk({ start_ms: 1000, speaker: 0, text: 'first' }), // webhook retry
    ]);
    expect(out).toHaveLength(1);
  });

  it('keeps two speakers that share a start_ms', () => {
    const out = normalizeChunks([
      chunk({ start_ms: 1000, speaker: 0, text: 'coach' }),
      chunk({ start_ms: 1000, speaker: 1, text: 'client' }),
    ]);
    expect(out).toHaveLength(2);
  });

  it('preserves correctness across out-of-order arrivals', () => {
    const out = normalizeChunks([
      chunk({ start_ms: 5000, text: 'last' }),
      chunk({ start_ms: 0, text: 'first' }),
    ]);
    expect(out[0].text).toBe('first');
    expect(out[1].text).toBe('last');
  });

  it('does not mutate the input array', () => {
    const input = [chunk({ start_ms: 2000 }), chunk({ start_ms: 1000 })];
    normalizeChunks(input);
    expect(input[0].start_ms).toBe(2000);
  });

  it('returns an empty array for empty input', () => {
    expect(normalizeChunks([])).toEqual([]);
  });
});

describe('speakerLabel', () => {
  it('uses the real name when present', () => {
    expect(speakerLabel(chunk({ speaker_name: 'Alice' }))).toBe('Alice');
  });

  it('falls back to "Speaker N"', () => {
    expect(speakerLabel(chunk({ speaker: 2, speaker_name: null }))).toBe(
      'Speaker 2'
    );
  });
});

describe('concatTranscriptText', () => {
  it('formats normalized chunks as labelled lines', () => {
    const text = concatTranscriptText([
      chunk({ start_ms: 1000, speaker: 1, speaker_name: null, text: 'hi' }),
      chunk({ start_ms: 0, speaker: 0, speaker_name: 'Alice', text: 'hello' }),
    ]);
    expect(text).toBe('[Alice] hello\n[Speaker 1] hi');
  });

  it('returns an empty string for no chunks', () => {
    expect(concatTranscriptText([])).toBe('');
  });
});

describe('appendTranscriptChunk', () => {
  it('calls the append_transcript_chunk RPC with the chunk', async () => {
    const rpc = jest.fn().mockResolvedValue({ error: null });
    const c = chunk({ start_ms: 1000 });
    await appendTranscriptChunk('rs-1', c, { rpc } as never);
    expect(rpc).toHaveBeenCalledWith('append_transcript_chunk', {
      p_recall_session_id: 'rs-1',
      p_chunk: c,
    });
  });

  it('throws when the RPC returns an error', async () => {
    const rpc = jest.fn().mockResolvedValue({ error: { message: 'boom' } });
    await expect(
      appendTranscriptChunk('rs-1', chunk({}), { rpc } as never)
    ).rejects.toThrow('boom');
  });
});
