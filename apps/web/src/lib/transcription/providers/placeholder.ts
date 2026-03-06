import type { TranscriptionProvider, TranscriptResult } from '../provider';

export class PlaceholderTranscriptionProvider implements TranscriptionProvider {
  async transcribe(_audioUrl: string): Promise<TranscriptResult> {
    await new Promise(r => setTimeout(r, 500));
    return {
      text: '[PLACEHOLDER] This is a mock transcription. Configure TRANSCRIPTION_PROVIDER=deepgram for real transcription.\n\nCoach: Welcome back. How has your week been since our last session?\n\nClient: It has been challenging but I made progress on the accountability structure we discussed.\n\nCoach: Tell me more about that progress.',
      speakers: [
        {
          label: 'Coach',
          words:
            'Welcome back. How has your week been since our last session? Tell me more about that progress.',
        },
        {
          label: 'Client',
          words:
            'It has been challenging but I made progress on the accountability structure we discussed.',
        },
      ],
      duration: 2700, // 45 minutes
    };
  }
}
