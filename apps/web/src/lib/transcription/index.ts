import type { TranscriptionProvider } from './provider';
import { PlaceholderTranscriptionProvider } from './providers/placeholder';

let _provider: TranscriptionProvider | undefined;

function createProvider(): TranscriptionProvider {
  const providerName = process.env.TRANSCRIPTION_PROVIDER || 'placeholder';
  if (providerName === 'deepgram') {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key)
      throw new Error(
        'DEEPGRAM_API_KEY required for TRANSCRIPTION_PROVIDER=deepgram'
      );
    const { DeepgramProvider } = require('./providers/deepgram');
    return new DeepgramProvider(key) as TranscriptionProvider;
  }
  return new PlaceholderTranscriptionProvider();
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (!_provider) _provider = createProvider();
  return _provider;
}
