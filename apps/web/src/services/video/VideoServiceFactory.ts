/**
 * Video Service Factory
 *
 * Factory for creating video service instances based on configuration.
 * This allows switching video providers by changing an environment variable.
 *
 * Supported Providers:
 * - stream: Stream Video SDK (default, SFU architecture)
 * - livekit: LiveKit (future implementation)
 *
 * Usage:
 * ```typescript
 * const videoService = VideoServiceFactory.create();
 * await videoService.initialize(config);
 * await videoService.joinCall();
 * ```
 *
 * To switch providers:
 * 1. Set NEXT_PUBLIC_VIDEO_PROVIDER=livekit in .env.local
 * 2. Implement LiveKitVideoService
 * 3. Restart the application
 */

import { VideoServiceInterface } from './VideoServiceInterface';
import { StreamVideoService } from './StreamVideoService';
import { LiveKitVideoService } from './LiveKitVideoService';

/**
 * Supported video provider types
 */
export type VideoProvider = 'stream' | 'livekit';

/**
 * Video Service Factory
 */
export class VideoServiceFactory {
  /**
   * Create a video service instance based on configuration
   *
   * @param provider - Optional provider override (defaults to env var)
   * @returns VideoServiceInterface implementation
   * @throws Error if provider is unknown or not configured
   */
  static create(provider?: VideoProvider): VideoServiceInterface {
    const selectedProvider =
      provider ||
      (process.env.NEXT_PUBLIC_VIDEO_PROVIDER as VideoProvider) ||
      'stream';

    console.log(
      '[VideoServiceFactory] Creating video service:',
      selectedProvider
    );

    switch (selectedProvider) {
      case 'stream':
        return new StreamVideoService();

      case 'livekit':
        return new LiveKitVideoService();

      default:
        throw new Error(
          `Unknown video provider: ${selectedProvider}. Supported providers: stream, livekit`
        );
    }
  }

  /**
   * Get the currently configured provider
   *
   * @returns Current provider name
   */
  static getCurrentProvider(): VideoProvider {
    return (
      (process.env.NEXT_PUBLIC_VIDEO_PROVIDER as VideoProvider) || 'stream'
    );
  }

  /**
   * Check if a provider is available
   *
   * @param provider - Provider to check
   * @returns True if provider is implemented
   */
  static isProviderAvailable(provider: VideoProvider): boolean {
    switch (provider) {
      case 'stream':
        return true;
      case 'livekit':
        return false; // Not yet implemented
      default:
        return false;
    }
  }

  /**
   * Get list of all available providers
   *
   * @returns Array of available provider names
   */
  static getAvailableProviders(): VideoProvider[] {
    return ['stream']; // Only Stream is currently implemented
  }
}
