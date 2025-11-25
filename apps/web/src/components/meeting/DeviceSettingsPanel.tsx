import React, { useState, useRef, useEffect } from 'react';
import { Settings, Mic, Video, Volume2, RefreshCw } from 'lucide-react';
import { useDevices } from './useDevices';
import { useAudioLevel } from './useAudioLevel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface DeviceSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stream?: MediaStream | null;
}

export const DeviceSettingsPanel: React.FC<DeviceSettingsPanelProps> = ({
  open,
  onOpenChange,
  stream,
}) => {
  const {
    cameras,
    microphones,
    speakers,
    isLoading,
    preferences,
    refreshDevices,
    savePreferences,
  } = useDevices();

  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string | null>(
    null
  );
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [volume, setVolume] = useState(75);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get audio level for microphone test
  const { audioLevel } = useAudioLevel({ stream });

  // Initialize selections from preferences
  useEffect(() => {
    setSelectedCamera(preferences.cameraId);
    setSelectedMicrophone(preferences.microphoneId);
    setSelectedSpeaker(preferences.speakerId);
  }, [preferences]);

  // Setup camera preview
  useEffect(() => {
    if (!open || !selectedCamera) return;

    const setupPreview = async () => {
      try {
        // Stop previous stream if exists
        if (previewStreamRef.current) {
          previewStreamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCamera } },
          audio: false,
        });

        previewStreamRef.current = stream;

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to setup camera preview:', error);
      }
    };

    setupPreview();

    return () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup audio context if still active
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [open, selectedCamera]);

  // Handle camera selection
  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    savePreferences({ cameraId });
  };

  // Handle microphone selection
  const handleMicrophoneChange = (microphoneId: string) => {
    setSelectedMicrophone(microphoneId);
    savePreferences({ microphoneId });
  };

  // Handle speaker selection
  const handleSpeakerChange = (speakerId: string) => {
    setSelectedSpeaker(speakerId);
    savePreferences({ speakerId });
  };

  // Test speaker with audio playback (generates tone dynamically)
  const handleTestSpeaker = () => {
    try {
      setIsTestingAudio(true);

      // Create audio context for dynamic tone generation
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillator (440Hz = A4 note)
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';

      // Set volume based on slider
      const normalizedVolume = volume / 100;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        normalizedVolume * 0.3,
        audioContext.currentTime + 0.1
      );

      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.9);

      // Play for 2 seconds
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);

      // Reset testing state after playback
      setTimeout(() => {
        setIsTestingAudio(false);
        audioContext.close();
        audioContextRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to play test audio:', error);
      setIsTestingAudio(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    // Volume will be applied when test tone is played
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Device Settings
            </DialogTitle>
            <DialogDescription>
              Configure your camera, microphone, and speaker settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Camera Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="camera-select"
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Camera
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshDevices}
                  disabled={isLoading}
                  aria-label="Refresh devices"
                >
                  <RefreshCw
                    className={cn('h-4 w-4', isLoading && 'animate-spin')}
                  />
                </Button>
              </div>

              <Select
                value={selectedCamera || undefined}
                onValueChange={handleCameraChange}
                disabled={isLoading || cameras.length === 0}
              >
                <SelectTrigger id="camera-select">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map(camera => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Camera Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!selectedCamera && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Video className="h-12 w-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Microphone Settings */}
            <div className="space-y-3">
              <Label
                htmlFor="microphone-select"
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Microphone
              </Label>

              <Select
                value={selectedMicrophone || undefined}
                onValueChange={handleMicrophoneChange}
                disabled={isLoading || microphones.length === 0}
              >
                <SelectTrigger id="microphone-select">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {microphones.map(mic => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Audio Level Meter */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Audio Level</Label>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-100',
                      audioLevel > 70
                        ? 'bg-red-500'
                        : audioLevel > 40
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                    )}
                    style={{ width: `${audioLevel}%` }}
                    role="progressbar"
                    aria-valuenow={audioLevel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Audio level indicator"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Speak to test your microphone
                </p>
              </div>
            </div>

            {/* Speaker Settings */}
            <div className="space-y-3">
              <Label
                htmlFor="speaker-select"
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Speaker / Output
              </Label>

              <Select
                value={selectedSpeaker || undefined}
                onValueChange={handleSpeakerChange}
                disabled={isLoading || speakers.length === 0}
              >
                <SelectTrigger id="speaker-select">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map(speaker => (
                    <SelectItem key={speaker.deviceId} value={speaker.deviceId}>
                      {speaker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-500">Volume</Label>
                  <span className="text-sm text-gray-500">{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                  aria-label="Volume slider"
                />
              </div>

              {/* Test Speaker Button */}
              <Button
                variant="outline"
                onClick={handleTestSpeaker}
                disabled={!selectedSpeaker || isTestingAudio}
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isTestingAudio ? 'Testing...' : 'Test Speaker'}
              </Button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
