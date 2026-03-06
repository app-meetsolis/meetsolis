import type {
  TranscriptionProvider,
  TranscriptResult,
  Speaker,
} from '../provider';

export class DeepgramProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioUrl: string): Promise<TranscriptResult> {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&paragraphs=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: audioUrl }),
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.results?.channels?.[0]?.alternatives?.[0];

    if (!result) throw new Error('No transcription result from Deepgram');

    const text = result.transcript || '';
    const duration = data.metadata?.duration || 0;

    // Build speaker segments from words
    const speakerMap = new Map<number, string[]>();
    for (const word of result.words || []) {
      const speaker = word.speaker ?? 0;
      if (!speakerMap.has(speaker)) speakerMap.set(speaker, []);
      speakerMap.get(speaker)!.push(word.word);
    }

    const speakers: Speaker[] = Array.from(speakerMap.entries()).map(
      ([id, words]) => ({
        label: id === 0 ? 'Coach' : `Speaker ${id + 1}`,
        words: words.join(' '),
      })
    );

    return { text, speakers, duration };
  }
}
