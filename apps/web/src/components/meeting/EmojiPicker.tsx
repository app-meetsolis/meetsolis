/**
 * Simple Emoji Picker Component
 * Story 2.4 - Emoji Reactions
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const QUICK_EMOJIS = [
  '👍',
  '👎',
  '👏',
  '❤️',
  '😀',
  '🤔',
  '✋',
  '🎉',
  '🔥',
  '👀',
];

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  return (
    <div
      className={cn(
        'absolute bottom-full right-0 mb-2 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg',
        'grid grid-cols-5 gap-1',
        className
      )}
    >
      {QUICK_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-700 rounded transition-colors"
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
