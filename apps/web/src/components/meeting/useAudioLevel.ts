/**
 * useAudioLevel Hook
 * Monitors audio input level for microphone testing
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAudioLevelOptions {
  stream: MediaStream | null;
  smoothingTimeConstant?: number;
  fftSize?: number;
}

export interface UseAudioLevelResult {
  audioLevel: number; // 0-100
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Hook for monitoring audio input level
 */
export function useAudioLevel({
  stream,
  smoothingTimeConstant = 0.8,
  fftSize = 256,
}: UseAudioLevelOptions): UseAudioLevelResult {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Start monitoring audio level
   */
  const startMonitoring = useCallback(() => {
    if (!stream || isMonitoring) return;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyser.fftSize = fftSize;
      analyserRef.current = analyser;

      // Connect stream to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMonitoring(true);

      // Start monitoring loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS (Root Mean Square) for more accurate level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Normalize to 0-100 range
        const normalized = Math.min(100, (rms / 128) * 100);
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
      setIsMonitoring(false);
    }
  }, [stream, isMonitoring, smoothingTimeConstant, fftSize]);

  /**
   * Stop monitoring audio level
   */
  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsMonitoring(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount or stream change
  useEffect(() => {
    if (stream && isMonitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [stream]);

  return {
    audioLevel,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
}
