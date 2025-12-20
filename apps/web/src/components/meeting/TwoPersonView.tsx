/**
 * TwoPersonView Component
 *
 * Special layout for exactly 2 participants (host + 1 other).
 * Shows the remote participant large with padding,
 * and the local participant (self) in a small floating draggable window.
 *
 * This view does NOT use a grid - it's a focused 1-on-1 conversation layout.
 */

'use client';

import React from 'react';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import type { Participant } from '@meetsolis/shared';
import { StreamVideoTile } from './StreamVideoTile';
import { SelfView } from './SelfView';
import { cn } from '@/lib/utils';

export interface TwoPersonViewProps {
  /**
   * Local participant (yourself)
   */
  localParticipant: StreamVideoParticipant | null;

  /**
   * Remote participant (the other person)
   */
  remoteParticipant: StreamVideoParticipant;

  /**
   * Database participants with hand raise status
   */
  dbParticipants?: Participant[];

  /**
   * Whether immersive (fullscreen) mode is active
   */
  immersiveMode?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TwoPersonView Component
 *
 * Renders a focused 1-on-1 layout:
 * - Remote participant fills the main area (with nice padding)
 * - Local participant shown in small floating self-view (bottom-right)
 *
 * @param localParticipant - Your video participant object
 * @param remoteParticipant - The other person's video participant object
 * @param immersiveMode - Whether fullscreen mode is active
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TwoPersonView
 *   localParticipant={localParticipant}
 *   remoteParticipant={remoteParticipant}
 *   immersiveMode={false}
 * />
 * ```
 */
export function TwoPersonView({
  localParticipant,
  remoteParticipant,
  dbParticipants = [],
  immersiveMode = false,
  className,
}: TwoPersonViewProps) {
  /**
   * Helper to check if participant has raised hand
   */
  const isHandRaised = (userId: string): boolean => {
    const dbParticipant = dbParticipants.find(p => p.user_id === userId);
    return dbParticipant?.hand_raised || false;
  };

  return (
    <div className={cn('relative h-full w-full bg-gray-900', className)}>
      {/* Remote Participant - Full width/height with minimal padding */}
      <div className="absolute inset-0 p-2 md:p-3">
        <StreamVideoTile
          participant={remoteParticipant}
          handRaised={isHandRaised(remoteParticipant.userId)}
          className="w-full h-full rounded-lg overflow-hidden"
          isSingleParticipant={false}
          fillContainer={true}
        />
      </div>

      {/* Self View - Small floating draggable window (bottom-right) */}
      {localParticipant && (
        <SelfView
          localParticipant={localParticipant}
          immersiveMode={immersiveMode}
          forceVisible={true} // Always show in 2-person mode
        />
      )}
    </div>
  );
}
