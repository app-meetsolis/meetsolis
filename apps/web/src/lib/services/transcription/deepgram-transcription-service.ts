import {
  TranscriptionService,
  TranscriptionResult,
  ServiceStatus,
  ServiceInfo,
} from '@meetsolis/shared';
import { BaseService } from '../base-service';

export class DeepgramTranscriptionService
  extends BaseService
  implements TranscriptionService
{
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Deepgram Transcription Service',
      version: '1.0.0',
      description:
        'Deepgram Nova-2 audio transcription with speaker diarization',
      dependencies: ['deepgram-api'],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      const res = await fetch('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      return {
        status: res.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        errorCount: 0,
      };
    } catch {
      return {
        status: 'unavailable',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        errorCount: 1,
      };
    }
  }

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&smart_format=true',
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
      const err = await response.text();
      throw new Error(`Deepgram API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const alternative = data?.results?.channels?.[0]?.alternatives?.[0];
    if (!alternative) {
      throw new Error('Deepgram response missing expected fields');
    }

    // Format with speaker diarization if utterances available
    const utterances: { speaker: number; transcript: string }[] =
      data?.results?.utterances ?? [];

    let text: string;
    if (utterances.length > 0) {
      text = utterances
        .map(
          u => `Speaker ${String.fromCharCode(65 + u.speaker)}: ${u.transcript}`
        )
        .join('\n');
    } else {
      // Fallback: prefer smart_format paragraphs, then raw transcript
      text = alternative.paragraphs?.transcript || alternative.transcript || '';
    }

    return {
      text,
      duration_seconds: data?.metadata?.duration,
      confidence: alternative.confidence,
    };
  }
}
