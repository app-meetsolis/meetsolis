/**
 * Stream SDK Utility Functions
 *
 * Helper functions for working with Stream Video SDK
 */

/**
 * Map Stream connection quality to standardized values
 *
 * @param quality - Stream SDK quality value
 * @returns Standardized quality: 'excellent' | 'good' | 'poor'
 */
export const mapConnectionQuality = (
  quality: string | undefined | unknown
): 'excellent' | 'good' | 'poor' => {
  if (!quality || typeof quality !== 'string') return 'good';

  const normalizedQuality = quality.toLowerCase();

  if (normalizedQuality === 'excellent') return 'excellent';
  if (normalizedQuality === 'poor') return 'poor';

  return 'good';
};

/**
 * Map Stream connection state to standardized values
 *
 * @param state - Stream SDK connection state
 * @returns Standardized state: 'connecting' | 'connected' | 'failed'
 */
export const mapConnectionState = (
  state: string
): 'connecting' | 'connected' | 'failed' => {
  const normalizedState = state.toLowerCase();

  if (normalizedState === 'connected') return 'connected';
  if (normalizedState === 'connecting' || normalizedState === 'reconnecting') {
    return 'connecting';
  }

  return 'failed';
};

/**
 * Format recording duration from milliseconds to HH:MM:SS
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted time string
 */
export const formatRecordingDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Check if a given track type is published by a participant
 *
 * @param publishedTracks - Array of published track types
 * @param trackType - Track type to check ('audio' | 'video')
 * @returns True if track is published
 */
export const isTrackPublished = (
  publishedTracks: string[],
  trackType: 'audio' | 'video'
): boolean => {
  return publishedTracks.includes(trackType);
};

/**
 * Generate a call ID from a meeting code
 * Ensures consistent call IDs across the application
 *
 * @param meetingCode - Meeting code
 * @returns Call ID for Stream
 */
export const generateCallId = (meetingCode: string): string => {
  // Use meeting code directly as call ID
  // Stream requires alphanumeric characters, hyphens, and underscores
  return meetingCode.replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Validate Stream API configuration
 *
 * @throws Error if Stream is not properly configured
 */
export const validateStreamConfig = (): void => {
  if (typeof window === 'undefined') {
    // Server-side validation
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      throw new Error(
        'Stream API credentials not configured on server. Set STREAM_API_KEY and STREAM_API_SECRET.'
      );
    }
  } else {
    // Client-side validation
    if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
      throw new Error(
        'Stream API key not configured on client. Set NEXT_PUBLIC_STREAM_API_KEY.'
      );
    }
  }
};

/**
 * Handle Stream SDK errors and provide user-friendly messages
 *
 * @param error - Error from Stream SDK
 * @returns User-friendly error message
 */
export const handleStreamError = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for common Stream errors
    if (error.message.includes('token')) {
      return 'Authentication failed. Please refresh and try again.';
    }
    if (error.message.includes('network')) {
      return 'Network connection lost. Please check your internet connection.';
    }
    if (error.message.includes('permission')) {
      return 'Please allow camera and microphone access to join the call.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
