import {
  TranscriptionService,
  TranscriptionResult,
  ServiceStatus,
  ServiceInfo,
} from '@meetsolis/shared';
import { BaseService } from '../base-service';

export class MockTranscriptionService
  extends BaseService
  implements TranscriptionService
{
  constructor() {
    super();
    this.enableFallbackMode();
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock Transcription Service',
      version: '1.0.0',
      description: 'Mock transcription service for development and testing',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      status: 'healthy',
      responseTime: 50,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async transcribe(_audioUrl: string): Promise<TranscriptionResult> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      text: "Speaker A: Good morning. Let's start by reviewing your goals from last session.\nSpeaker B: I've been thinking about delegation and I made some progress. I scheduled the 1:1s with my direct reports.\nSpeaker A: That's great to hear. How did those conversations go?\nSpeaker B: Better than I expected. I realized I was projecting my anxieties onto my team.\nSpeaker A: That's a significant insight. What do you want to focus on today?\nSpeaker B: I want to work on trusting my team more and letting go of control.",
      duration_seconds: 300,
      confidence: 0.95,
    };
  }
}
