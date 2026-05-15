/**
 * Unit tests — Recall.ai transcript.data schema + mapper (Story 6.2b)
 */

import { RecallTranscriptDataEventSchema, mapEventToChunk } from '../schema';

function validEvent() {
  return {
    event: 'transcript.data',
    data: {
      data: {
        words: [
          {
            text: 'hello',
            start_timestamp: { relative: 1.5 },
            end_timestamp: { relative: 2.0 },
          },
          {
            text: 'there',
            start_timestamp: { relative: 2.1 },
            end_timestamp: { relative: 2.8 },
          },
        ],
        participant: { id: 1, name: 'Alice' },
      },
      bot: { id: 'bot-123' },
      recording: { id: 'rec-123' },
    },
  };
}

describe('RecallTranscriptDataEventSchema', () => {
  it('accepts a valid transcript.data payload', () => {
    expect(
      RecallTranscriptDataEventSchema.safeParse(validEvent()).success
    ).toBe(true);
  });

  it('accepts a null end_timestamp', () => {
    const e = validEvent();
    e.data.data.words[1].end_timestamp = null as never;
    expect(RecallTranscriptDataEventSchema.safeParse(e).success).toBe(true);
  });

  it('accepts a null participant name', () => {
    const e = validEvent();
    e.data.data.participant.name = null as never;
    expect(RecallTranscriptDataEventSchema.safeParse(e).success).toBe(true);
  });

  it('rejects a wrong event type', () => {
    const e = validEvent();
    e.event = 'transcript.partial_data';
    expect(RecallTranscriptDataEventSchema.safeParse(e).success).toBe(false);
  });

  it('rejects a missing bot id', () => {
    const e = validEvent();
    delete (e.data as { bot?: unknown }).bot;
    expect(RecallTranscriptDataEventSchema.safeParse(e).success).toBe(false);
  });

  it('rejects a non-integer participant id', () => {
    const e = validEvent();
    e.data.data.participant.id = 1.5 as never;
    expect(RecallTranscriptDataEventSchema.safeParse(e).success).toBe(false);
  });

  it('rejects a malformed payload', () => {
    expect(
      RecallTranscriptDataEventSchema.safeParse({ foo: 'bar' }).success
    ).toBe(false);
  });
});

describe('mapEventToChunk', () => {
  it('collapses words into one chunk with ms timestamps', () => {
    const event = RecallTranscriptDataEventSchema.parse(validEvent());
    expect(mapEventToChunk(event)).toEqual({
      speaker: 1,
      speaker_name: 'Alice',
      text: 'hello there',
      start_ms: 1500,
      end_ms: 2800,
    });
  });

  it('falls back to last word start when end_timestamp is null', () => {
    const e = validEvent();
    e.data.data.words = [
      {
        text: 'hi',
        start_timestamp: { relative: 4 },
        end_timestamp: null as never,
      },
    ];
    const chunk = mapEventToChunk(RecallTranscriptDataEventSchema.parse(e));
    expect(chunk?.end_ms).toBe(4000);
  });

  it('maps a null participant name to a null speaker_name', () => {
    const e = validEvent();
    e.data.data.participant.name = null as never;
    const chunk = mapEventToChunk(RecallTranscriptDataEventSchema.parse(e));
    expect(chunk?.speaker_name).toBeNull();
  });

  it('returns null when there are no words', () => {
    const e = validEvent();
    e.data.data.words = [];
    const chunk = mapEventToChunk(RecallTranscriptDataEventSchema.parse(e));
    expect(chunk).toBeNull();
  });
});
