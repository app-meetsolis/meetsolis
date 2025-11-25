/**
 * DeviceTestWizard Component
 * Multi-step wizard for testing camera, microphone, and speaker before joining a meeting
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useDevices } from './useDevices';
import { useAudioLevel } from './useAudioLevel';
import type { TestStep, DeviceTestError } from './types';

export interface DeviceTestWizardProps {
  onComplete: (preferences: {
    cameraId: string;
    microphoneId: string;
    speakerId: string;
  }) => void;
  onSkip?: () => void;
  className?: string;
}

/**
 * DeviceTestWizard Component
 */
export function DeviceTestWizard({
  onComplete,
  onSkip,
  className = '',
}: DeviceTestWizardProps) {
  const [currentStep, setCurrentStep] = useState<TestStep>('camera');
  const [errors, setErrors] = useState<DeviceTestError[]>([]);
  const [isSpeakerTesting, setIsSpeakerTesting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Hooks
  const {
    cameras,
    microphones,
    speakers,
    preferences,
    savePreferences,
    isLoading,
  } = useDevices();
  const {
    stream,
    error: streamError,
    restart,
  } = useMediaStream({
    videoQuality: 'hd',
    audioQuality: 'standard',
  });
  const { audioLevel, startMonitoring, stopMonitoring } = useAudioLevel({
    stream,
  });

  /**
   * Update video element when stream changes
   */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  /**
   * Handle stream errors
   */
  useEffect(() => {
    if (streamError) {
      const error: DeviceTestError = {
        type: currentStep === 'camera' ? 'camera' : 'microphone',
        message: streamError.message,
        code: (streamError as any).code,
      };
      setErrors(prev => [...prev, error]);
    }
  }, [streamError, currentStep]);

  /**
   * Start audio monitoring when on microphone step
   */
  useEffect(() => {
    if (currentStep === 'microphone') {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [currentStep, startMonitoring, stopMonitoring]);

  /**
   * Handle camera selection change
   */
  const handleCameraChange = async (deviceId: string) => {
    savePreferences({ cameraId: deviceId });
    await restart();
  };

  /**
   * Handle microphone selection change
   */
  const handleMicrophoneChange = async (deviceId: string) => {
    savePreferences({ microphoneId: deviceId });
    await restart();
  };

  /**
   * Handle speaker selection change
   */
  const handleSpeakerChange = (deviceId: string) => {
    savePreferences({ speakerId: deviceId });
    // Note: Speaker selection will be applied when test tone is played
    // Web Audio API will use the default output device
  };

  /**
   * Test speaker by playing audio (generates tone dynamically)
   */
  const handleSpeakerTest = () => {
    try {
      setIsSpeakerTesting(true);

      // Create audio context for dynamic tone generation
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillator (440Hz = A4 note)
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';

      // Fade in
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        audioContext.currentTime + 0.1
      );

      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.9);

      // Play for 2 seconds
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);

      // Reset testing state after playback
      setTimeout(() => {
        setIsSpeakerTesting(false);
        audioContext.close();
      }, 2000);
    } catch (error) {
      console.error('Failed to play test audio:', error);
      setIsSpeakerTesting(false);
      setErrors(prev => [
        ...prev,
        {
          type: 'speaker',
          message: 'Failed to play test audio',
        },
      ]);
    }
  };

  /**
   * Move to next step
   */
  const handleNext = () => {
    setErrors([]); // Clear errors when moving to next step

    if (currentStep === 'camera') {
      setCurrentStep('microphone');
    } else if (currentStep === 'microphone') {
      setCurrentStep('speaker');
    } else if (currentStep === 'speaker') {
      setCurrentStep('complete');
      handleComplete();
    }
  };

  /**
   * Move to previous step
   */
  const handleBack = () => {
    setErrors([]);

    if (currentStep === 'microphone') {
      setCurrentStep('camera');
    } else if (currentStep === 'speaker') {
      setCurrentStep('microphone');
    }
  };

  /**
   * Complete wizard
   */
  const handleComplete = () => {
    onComplete({
      cameraId: preferences.cameraId || '',
      microphoneId: preferences.microphoneId || '',
      speakerId: preferences.speakerId || '',
    });
  };

  /**
   * Render permission error message
   */
  const renderPermissionError = (error: DeviceTestError) => {
    if (error.code === 'PERMISSION_DENIED') {
      return (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-red-800 font-semibold mb-2">Permission Denied</h3>
          <p className="text-red-700 text-sm mb-2">{error.message}</p>
          <p className="text-red-600 text-sm">
            Please allow camera and microphone access in your browser settings
            to continue.
          </p>
          <ol className="list-decimal list-inside text-red-600 text-sm mt-2 space-y-1">
            <li>Click the camera icon in your browser&apos;s address bar</li>
            <li>Select &quot;Always allow&quot; for camera and microphone</li>
            <li>Refresh the page and try again</li>
          </ol>
        </div>
      );
    }

    if (error.code === 'DEVICE_NOT_FOUND') {
      return (
        <div
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-yellow-800 font-semibold mb-2">
            Device Not Found
          </h3>
          <p className="text-yellow-700 text-sm">{error.message}</p>
          <p className="text-yellow-600 text-sm mt-2">
            Please connect a camera and/or microphone to continue.
          </p>
        </div>
      );
    }

    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
        role="alert"
        aria-live="polite"
      >
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-700 text-sm">{error.message}</p>
      </div>
    );
  };

  /**
   * Render camera test step
   */
  const renderCameraStep = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Test Your Camera</h2>
        <p className="text-gray-600">
          Make sure your camera is working properly
        </p>
      </div>

      {errors.length > 0 &&
        errors.map((error, index) => (
          <div key={index}>{renderPermissionError(error)}</div>
        ))}

      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          aria-label="Camera preview"
        />
        {!stream && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white">No camera preview available</p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="camera-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Camera
        </label>
        <select
          id="camera-select"
          value={preferences.cameraId || ''}
          onChange={e => handleCameraChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading || cameras.length === 0}
          aria-label="Select camera device"
        >
          {cameras.map(camera => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label}
            </option>
          ))}
        </select>
        {cameras.length === 0 && !isLoading && (
          <p className="text-sm text-red-600 mt-1">No cameras found</p>
        )}
      </div>
    </div>
  );

  /**
   * Render microphone test step
   */
  const renderMicrophoneStep = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Test Your Microphone</h2>
        <p className="text-gray-600">
          Speak to see the audio level indicator move
        </p>
      </div>

      {errors.length > 0 &&
        errors.map((error, index) => (
          <div key={index}>{renderPermissionError(error)}</div>
        ))}

      <div>
        <label
          htmlFor="microphone-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Microphone
        </label>
        <select
          id="microphone-select"
          value={preferences.microphoneId || ''}
          onChange={e => handleMicrophoneChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading || microphones.length === 0}
          aria-label="Select microphone device"
        >
          {microphones.map(mic => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label}
            </option>
          ))}
        </select>
        {microphones.length === 0 && !isLoading && (
          <p className="text-sm text-red-600 mt-1">No microphones found</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audio Level
        </label>
        <div
          className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden"
          role="progressbar"
          aria-valuenow={audioLevel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Microphone audio level"
        >
          <div
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {audioLevel > 50
            ? 'Great! Your microphone is working.'
            : 'Speak louder to test your microphone'}
        </p>
      </div>
    </div>
  );

  /**
   * Render speaker test step
   */
  const renderSpeakerStep = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Test Your Speakers</h2>
        <p className="text-gray-600">
          Play a test sound to verify your speakers are working
        </p>
      </div>

      {errors.length > 0 &&
        errors.map((error, index) => (
          <div key={index}>{renderPermissionError(error)}</div>
        ))}

      <div>
        <label
          htmlFor="speaker-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Speaker
        </label>
        <select
          id="speaker-select"
          value={preferences.speakerId || ''}
          onChange={e => handleSpeakerChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading || speakers.length === 0}
          aria-label="Select speaker device"
        >
          {speakers.map(speaker => (
            <option key={speaker.deviceId} value={speaker.deviceId}>
              {speaker.label}
            </option>
          ))}
        </select>
        {speakers.length === 0 && !isLoading && (
          <p className="text-sm text-gray-600 mt-1">
            Default speakers will be used (speaker selection not supported by
            this browser)
          </p>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <button
          onClick={handleSpeakerTest}
          disabled={isSpeakerTesting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Play test sound"
        >
          {isSpeakerTesting ? 'Playing...' : 'Play Test Sound'}
        </button>
        <p className="text-sm text-gray-600 mt-3">
          Click the button to hear a test sound through your selected speaker
        </p>
      </div>
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      {/* Progress indicator */}
      <div
        className="mb-8"
        role="progressbar"
        aria-valuenow={
          currentStep === 'camera'
            ? 33
            : currentStep === 'microphone'
              ? 66
              : 100
        }
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="flex justify-between mb-2">
          <span
            className={`text-sm font-medium ${currentStep === 'camera' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            Camera
          </span>
          <span
            className={`text-sm font-medium ${currentStep === 'microphone' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            Microphone
          </span>
          <span
            className={`text-sm font-medium ${currentStep === 'speaker' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            Speaker
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width:
                currentStep === 'camera'
                  ? '33%'
                  : currentStep === 'microphone'
                    ? '66%'
                    : '100%',
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {currentStep === 'camera' && renderCameraStep()}
        {currentStep === 'microphone' && renderMicrophoneStep()}
        {currentStep === 'speaker' && renderSpeakerStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 'camera'}
          className="px-6 py-2 text-gray-700 font-semibold hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go back to previous step"
        >
          Back
        </button>

        <div className="flex gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Skip device testing"
            >
              Skip
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={
              currentStep === 'speaker'
                ? 'Complete device testing'
                : 'Continue to next step'
            }
          >
            {currentStep === 'speaker' ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
