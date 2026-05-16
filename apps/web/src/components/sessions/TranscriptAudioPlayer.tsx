'use client';

/**
 * TranscriptAudioPlayer (Story 6.2c)
 * Native HTML5 audio player. Streams the recording directly from Recall's
 * signed URL — no metered cost. forwardRef exposes the element so a parent
 * can seek imperatively (click-to-seek transcript).
 */

import { forwardRef } from 'react';

interface Props {
  src: string;
  onTimeUpdate?: (ms: number) => void;
}

export const TranscriptAudioPlayer = forwardRef<HTMLAudioElement, Props>(
  function TranscriptAudioPlayer({ src, onTimeUpdate }, ref) {
    return (
      <audio
        ref={ref}
        src={src}
        controls
        preload="metadata"
        className="w-full"
        onTimeUpdate={e =>
          onTimeUpdate?.(Math.round(e.currentTarget.currentTime * 1000))
        }
      >
        Your browser does not support audio playback.
      </audio>
    );
  }
);
