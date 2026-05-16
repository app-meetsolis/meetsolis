'use client';

/**
 * TranscriptAudioPlayer (Story 6.2c)
 * Plays the meeting recording streamed directly from Recall's signed URL —
 * no metered cost. Recall records `video_mixed_mp4`, so this uses a <video>
 * element (an <audio> element cannot reliably load an mp4 container).
 * forwardRef exposes the element so a parent can seek imperatively.
 */

import { forwardRef } from 'react';

interface Props {
  src: string;
  onTimeUpdate?: (ms: number) => void;
  onError?: () => void;
}

export const TranscriptAudioPlayer = forwardRef<HTMLVideoElement, Props>(
  function TranscriptAudioPlayer({ src, onTimeUpdate, onError }, ref) {
    return (
      <video
        ref={ref}
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-full max-h-[260px] rounded-lg bg-black"
        onTimeUpdate={e =>
          onTimeUpdate?.(Math.round(e.currentTarget.currentTime * 1000))
        }
        onError={() => onError?.()}
      >
        Your browser does not support video playback.
      </video>
    );
  }
);
