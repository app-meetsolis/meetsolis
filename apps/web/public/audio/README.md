# Test Audio Files

This directory contains audio files used for device testing in the DeviceTestWizard component.

## Required Files

### test-sound.mp3

- **Purpose**: Used for speaker testing in the DeviceTestWizard
- **Duration**: 3-5 seconds recommended
- **Format**: MP3, AAC, or WAV
- **Content**: Simple tone (e.g., 440Hz sine wave) or voice message "This is a test sound"
- **Volume**: Normalized to prevent distortion

## How to Add Test Sound

### Option 1: Use a Free Sound Library

1. Download from [FreeSound.org](https://freesound.org/) or [Zapsplat](https://www.zapsplat.com/)
2. Search for "test tone" or "beep"
3. Download and rename to `test-sound.mp3`
4. Place in this directory

### Option 2: Generate Programmatically

Use this JavaScript to generate a test tone in the browser:

```javascript
// Generate 440Hz sine wave for 2 seconds
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440;
oscillator.connect(audioContext.destination);
oscillator.start();
setTimeout(() => oscillator.stop(), 2000);
```

### Option 3: Use Online Generator

1. Visit [Online Tone Generator](https://www.szynalski.com/tone-generator/)
2. Set frequency to 440Hz
3. Record for 3 seconds
4. Save as MP3

## Alternative Implementation

If you prefer to generate audio dynamically instead of using a static file, update `DeviceTestWizard.tsx`:

```typescript
// Replace the <audio> element with dynamic audio generation
const handleSpeakerTest = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 440; // A4 note
  oscillator.type = 'sine';

  // Fade in
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);

  // Fade out
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.9);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);

  setIsSpeakerTesting(true);
  setTimeout(() => setIsSpeakerTesting(false), 2000);
};
```

## License

Ensure any audio files used comply with licensing requirements for your project.
