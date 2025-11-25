import { useState, useCallback, useEffect } from 'react';

export interface VideoControlsOptions {
  stream: MediaStream | null;
  onVideoChange?: (isVideoOff: boolean) => void;
  defaultVideoOff?: boolean;
}

export interface VideoControlsReturn {
  isVideoOff: boolean;
  toggleVideo: () => void;
  setVideoOff: (off: boolean) => void;
  hasVideoTrack: boolean;
}

/**
 * Hook for managing video controls in a meeting
 * Handles video on/off with privacy-first defaults
 */
export const useVideoControls = ({
  stream,
  onVideoChange,
  defaultVideoOff = true,
}: VideoControlsOptions): VideoControlsReturn => {
  const [isVideoOff, setIsVideoOff] = useState(defaultVideoOff);

  // Get video track from stream
  const getVideoTrack = useCallback((): MediaStreamTrack | undefined => {
    const tracks = stream?.getVideoTracks();
    return tracks?.[0];
  }, [stream]);

  // Check if video track exists
  const hasVideoTrack = !!getVideoTrack();

  // Set video state
  const setVideoOff = useCallback(
    (off: boolean) => {
      const videoTrack = getVideoTrack();
      if (!videoTrack) {
        console.warn('No video track available');
        return;
      }

      // Smooth transition: disable track
      videoTrack.enabled = !off;
      setIsVideoOff(off);
      onVideoChange?.(off);
    },
    [getVideoTrack, onVideoChange]
  );

  // Toggle video
  const toggleVideo = useCallback(() => {
    setVideoOff(!isVideoOff);
  }, [isVideoOff, setVideoOff]);

  // Apply default video-off state when stream becomes available
  useEffect(() => {
    if (!stream) return;

    const videoTrack = getVideoTrack();
    if (videoTrack && defaultVideoOff) {
      videoTrack.enabled = false;
      setIsVideoOff(true);
    }
  }, [stream, defaultVideoOff, getVideoTrack]);

  // Cleanup: stop video track on unmount if needed
  useEffect(() => {
    return () => {
      // Note: We don't stop the track here as it's managed by the parent MediaStream
      // The track will be stopped when the stream is cleaned up
    };
  }, []);

  return {
    isVideoOff,
    toggleVideo,
    setVideoOff,
    hasVideoTrack,
  };
};
