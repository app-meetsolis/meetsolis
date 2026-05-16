'use client';

/**
 * SyncedTranscriptView (Story 6.2c)
 * Transcript lines synced to audio playback. Click a line to seek the audio
 * there; the line currently playing is highlighted and scrolled into view.
 * Self-contained — driven entirely by props, no audio element of its own.
 */

import { useEffect, useRef } from 'react';
import type { TranscriptChunk } from '@meetsolis/shared';

interface Props {
  chunks: TranscriptChunk[];
  currentMs: number;
  onSeek: (ms: number) => void;
}

function speakerLabel(c: TranscriptChunk): string {
  return c.speaker_name ?? `Speaker ${c.speaker}`;
}

export function SyncedTranscriptView({ chunks, currentMs, onSeek }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Sorted by start_ms — the active line is the last one at or before now.
  let activeIdx = -1;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].start_ms <= currentMs) activeIdx = i;
    else break;
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  if (chunks.length === 0) {
    return (
      <p className="py-6 text-center text-[12px] text-foreground/30">
        No timed transcript for this session.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {chunks.map((c, i) => {
        const isActive = i === activeIdx;
        return (
          <li key={`${c.start_ms}-${c.speaker}-${i}`}>
            <button
              type="button"
              ref={isActive ? activeRef : undefined}
              onClick={() => onSeek(c.start_ms)}
              className={`w-full rounded-md px-3 py-2 text-left text-[13px] leading-relaxed transition-colors ${
                isActive ? 'bg-primary/10' : 'hover:bg-foreground/[0.04]'
              }`}
            >
              <span
                className={
                  c.speaker === 0
                    ? 'font-semibold text-primary'
                    : 'font-semibold text-foreground/55'
                }
              >
                {speakerLabel(c)}:
              </span>{' '}
              <span
                className={
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }
              >
                {c.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
