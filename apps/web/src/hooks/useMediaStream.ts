/**
 * useMediaStream Hook
 * Manages local media stream with HD video constraints and bandwidth optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCErrorCode } from '../../../../packages/shared/types/webrtc';

export interface MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export interface MediaStreamOptions {
  videoQuality?: 'hd' | 'fullhd' | 'custom';
  audioQuality?: 'standard' | 'high';
  lowLatency?: boolean;
  autoMuteOnJoin?: boolean;
  noiseSuppression?: boolean;
}

export interface UseMediaStreamResult {
  stream: MediaStream | null;
  isLoading: boolean;
  error: Error | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  replaceTrack: (kind: 'audio' | 'video', deviceId: string) => Promise<void>;
  stop: () => void;
  restart: () => Promise<void>;
}

/**
 * Get media constraints based on quality options
 */
function getMediaConstraints(
  options: MediaStreamOptions
): MediaStreamConstraints {
  const {
    videoQuality = 'hd',
    audioQuality = 'standard',
    lowLatency = true,
    noiseSuppression = true,
  } = options;

  // Video constraints
  let videoConstraints: MediaTrackConstraints = {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
  };

  if (videoQuality === 'fullhd') {
    videoConstraints = {
      width: { min: 1280, ideal: 1920, max: 1920 },
      height: { min: 720, ideal: 1080, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
    };
  }

  // Audio constraints
  const audioConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: noiseSuppression,
    autoGainControl: true,
    ...(audioQuality === 'high' && {
      sampleRate: 48000,
      channelCount: 2,
    }),
  };

  // Low latency configuration
  if (lowLatency) {
    videoConstraints.latency = 0;
  }

  return {
    audio: audioConstraints,
    video: videoConstraints,
  };
}

/**
 * Hook for managing local media stream
 */
export function useMediaStream(
  options: MediaStreamOptions = {}
): UseMediaStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const constraintsRef = useRef<MediaStreamConstraints>(
    getMediaConstraints(options)
  );

  /**
   * Initialize media stream
   */
  const initializeStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraintsRef.current
      );

      // Set initial enabled states based on track state
      const audioTracks = mediaStream.getAudioTracks();
      const videoTracks = mediaStream.getVideoTracks();

      // Apply auto-mute if enabled
      if (options.autoMuteOnJoin && audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = false;
        });
        setIsAudioEnabled(false);
      } else if (audioTracks.length > 0) {
        setIsAudioEnabled(audioTracks[0].enabled);
      }

      if (videoTracks.length > 0) {
        setIsVideoEnabled(videoTracks[0].enabled);
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      const error = err as DOMException;
      let wrappedError: Error;

      if (error.name === 'NotAllowedError') {
        wrappedError = new Error('Camera/microphone permission denied');
        (wrappedError as any).code = WebRTCErrorCode.PERMISSION_DENIED;
      } else if (error.name === 'NotFoundError') {
        wrappedError = new Error('No camera/microphone found');
        (wrappedError as any).code = WebRTCErrorCode.DEVICE_NOT_FOUND;
      } else {
        wrappedError = new Error(
          `Failed to access media devices: ${error.message}`
        );
        (wrappedError as any).code = WebRTCErrorCode.STREAM_ERROR;
      }

      setError(wrappedError);
      console.error('Media stream error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [options.autoMuteOnJoin]);

  /**
   * Toggle audio mute/unmute
   */
  const toggleAudio = useCallback(() => {
    if (!streamRef.current) return;

    const audioTracks = streamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsAudioEnabled(!isAudioEnabled);
  }, [isAudioEnabled]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    if (!streamRef.current) return;

    const videoTracks = streamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  /**
   * Replace a track (for switching devices)
   */
  const replaceTrack = useCallback(
    async (kind: 'audio' | 'video', deviceId: string) => {
      if (!streamRef.current) {
        throw new Error('No active stream to replace track');
      }

      try {
        const constraints: MediaStreamConstraints =
          kind === 'audio'
            ? {
                audio: {
                  deviceId: { exact: deviceId },
                  ...(constraintsRef.current.audio as MediaTrackConstraints),
                },
              }
            : {
                video: {
                  deviceId: { exact: deviceId },
                  ...(constraintsRef.current.video as MediaTrackConstraints),
                },
              };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        const newTrack =
          kind === 'audio'
            ? newStream.getAudioTracks()[0]
            : newStream.getVideoTracks()[0];

        const oldTracks =
          kind === 'audio'
            ? streamRef.current.getAudioTracks()
            : streamRef.current.getVideoTracks();

        // Stop old tracks
        oldTracks.forEach(track => track.stop());

        // Remove old tracks
        oldTracks.forEach(track => streamRef.current?.removeTrack(track));

        // Add new track
        streamRef.current.addTrack(newTrack);

        // Update state
        setStream(new MediaStream(streamRef.current.getTracks()));
      } catch (err) {
        const error = new Error(
          `Failed to replace ${kind} track: ${(err as Error).message}`
        );
        (error as any).code = WebRTCErrorCode.DEVICE_NOT_FOUND;
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Stop all tracks and cleanup
   */
  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  /**
   * Restart stream (useful for error recovery)
   */
  const restart = useCallback(async () => {
    stop();
    await initializeStream();
  }, [stop, initializeStream]);

  // Initialize stream on mount
  useEffect(() => {
    initializeStream();

    // Cleanup on unmount
    return () => {
      stop();
    };
  }, []);

  return {
    stream,
    isLoading,
    error,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    replaceTrack,
    stop,
    restart,
  };
}
