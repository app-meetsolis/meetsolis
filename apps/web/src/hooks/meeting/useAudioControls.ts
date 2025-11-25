import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface AudioControlsOptions {
  stream: MediaStream | null;
  onMuteChange?: (isMuted: boolean) => void;
  enableNoiseSupression?: boolean;
  playAudioFeedback?: boolean;
}

export interface AudioControlsReturn {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  isSpeaking: boolean;
  audioLevel: number;
  noiseSuppressionEnabled: boolean;
  toggleNoiseSuppression: () => Promise<void>;
}

/**
 * Hook for managing audio controls in a meeting
 * Handles mute/unmute, noise suppression, and speaking detection
 */
export const useAudioControls = ({
  stream,
  onMuteChange,
  enableNoiseSupression = false,
  playAudioFeedback = false,
}: AudioControlsOptions): AudioControlsReturn => {
  const [isMuted, setIsMuted] = useState(true); // Default muted for privacy
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(
    enableNoiseSupression
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Get audio track from stream
  const getAudioTrack = useCallback((): MediaStreamTrack | undefined => {
    return stream?.getAudioTracks()[0];
  }, [stream]);

  // Play audio feedback (beep) on mute/unmute
  const playBeep = useCallback(
    (frequency: number, duration: number) => {
      if (!playAudioFeedback) return;

      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        // Cleanup
        setTimeout(
          () => {
            audioContext.close();
          },
          duration * 1000 + 100
        );
      } catch (error) {
        console.error('Failed to play audio feedback:', error);
      }
    },
    [playAudioFeedback]
  );

  // Set mute state
  const setMuted = useCallback(
    (muted: boolean) => {
      const audioTrack = getAudioTrack();
      if (!audioTrack) {
        console.warn('No audio track available');
        return;
      }

      audioTrack.enabled = !muted;
      setIsMuted(muted);
      onMuteChange?.(muted);

      // Play audio feedback
      if (muted) {
        playBeep(800, 0.1); // Lower pitch for mute
      } else {
        playBeep(1200, 0.1); // Higher pitch for unmute
      }
    },
    [getAudioTrack, onMuteChange, playBeep]
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  // Toggle noise suppression
  const toggleNoiseSuppression = useCallback(async () => {
    if (!stream) {
      toast.error('No audio stream available');
      return;
    }

    try {
      // Check if noise suppression is supported
      const constraints = { noiseSuppression: !noiseSuppressionEnabled };
      const supported =
        navigator.mediaDevices.getSupportedConstraints().noiseSuppression;

      if (!supported) {
        toast.warning('Noise suppression is not supported in this browser');
        return;
      }

      // Apply new constraints to the audio track
      const audioTrack = getAudioTrack();
      if (audioTrack) {
        await audioTrack.applyConstraints({
          noiseSuppression: !noiseSuppressionEnabled,
          echoCancellation: true,
          autoGainControl: true,
        });

        setNoiseSuppressionEnabled(!noiseSuppressionEnabled);
        toast.success(
          !noiseSuppressionEnabled
            ? 'Noise suppression enabled'
            : 'Noise suppression disabled'
        );
      }
    } catch (error) {
      console.error('Failed to toggle noise suppression:', error);
      toast.error('Failed to toggle noise suppression');
    }
  }, [stream, noiseSuppressionEnabled, getAudioTrack]);

  // Speaking detection using Web Audio API
  useEffect(() => {
    if (!stream) return;

    const audioTrack = getAudioTrack();
    if (!audioTrack) return;

    try {
      // Create Audio Context for speaking detection
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Speaking detection loop (runs at ~30 FPS)
      const detectSpeaking = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average audio level
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const normalizedLevel = Math.min(100, (average / 255) * 100);

        setAudioLevel(normalizedLevel);

        // Speaking threshold (adjust based on testing)
        const speakingThreshold = 30;
        const speaking = average > speakingThreshold && !isMuted;

        setIsSpeaking(speaking);

        // Continue loop at ~30 FPS
        animationFrameRef.current = requestAnimationFrame(detectSpeaking);
      };

      detectSpeaking();
    } catch (error) {
      console.error('Failed to initialize speaking detection:', error);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isMuted, getAudioTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    setMuted,
    isSpeaking,
    audioLevel,
    noiseSuppressionEnabled,
    toggleNoiseSuppression,
  };
};
