/**
 * Gladia transcription types (Story 6.3).
 *
 * Gladia v2 pre-recorded API returns diarized utterances. We re-transcribe
 * Recall.ai bot recordings through Gladia for high-quality speaker labels,
 * then map raw speaker indices to coach/client names.
 */

/**
 * One diarized utterance from Gladia — a contiguous span of speech by one
 * speaker. `speaker` is a 0-based integer index, stable within a transcript.
 * Stored raw in recall_sessions.diarized_transcript so the transcript can be
 * re-formatted whenever the coach corrects the speaker map.
 */
export interface DiarizedUtterance {
  speaker: number;
  text: string;
  /** Seconds from start of audio. */
  start: number;
  end: number;
}

/**
 * Maps a Gladia speaker key (`"speaker_0"`, `"speaker_1"`, …) to a display
 * name (`"Coach"`, the client's name, `"Unknown 1"`, or a coach-entered
 * custom label). Stored in recall_sessions.speaker_map.
 */
export type SpeakerMap = Record<string, string>;

/** Build the speaker_map key for a 0-based Gladia speaker index. */
export function speakerKey(speakerIndex: number): string {
  return `speaker_${speakerIndex}`;
}
