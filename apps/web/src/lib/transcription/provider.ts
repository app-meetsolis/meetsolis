export interface Speaker {
  label: string; // 'coach' | 'client' | 'speaker_0' etc.
  words: string;
}

export interface TranscriptResult {
  text: string;
  speakers: Speaker[];
  duration: number; // seconds
}

export interface TranscriptionProvider {
  transcribe(audioUrl: string): Promise<TranscriptResult>;
}
