/**
 * Meeting Context
 * Provides meeting state management throughout the application
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { WebRTCState } from '../../../../packages/shared/types/webrtc';
import type {
  Meeting,
  Participant,
} from '../../../../packages/shared/types/meeting';

export interface MeetingContextState {
  // Meeting state
  currentMeeting: Meeting | null;
  participants: Participant[];
  isLoading: boolean;
  error: Error | null;

  // WebRTC state
  webrtcState: WebRTCState | null;

  // Actions
  setCurrentMeeting: (meeting: Meeting | null) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (
    participantId: string,
    updates: Partial<Participant>
  ) => void;
  setWebRTCState: (state: WebRTCState | null) => void;
  setError: (error: Error | null) => void;
  resetMeeting: () => void;
}

const MeetingContext = createContext<MeetingContextState | undefined>(
  undefined
);

export interface MeetingProviderProps {
  children: ReactNode;
}

/**
 * Meeting Provider Component
 */
export function MeetingProvider({ children }: MeetingProviderProps) {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [webrtcState, setWebRTCState] = useState<WebRTCState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Add a participant
   */
  const addParticipant = useCallback((participant: Participant) => {
    setParticipants(prev => {
      // Check if participant already exists
      const exists = prev.find(p => p.id === participant.id);
      if (exists) {
        return prev;
      }
      return [...prev, participant];
    });
  }, []);

  /**
   * Remove a participant
   */
  const removeParticipant = useCallback((participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, []);

  /**
   * Update a participant
   */
  const updateParticipant = useCallback(
    (participantId: string, updates: Partial<Participant>) => {
      setParticipants(prev =>
        prev.map(p => (p.id === participantId ? { ...p, ...updates } : p))
      );
    },
    []
  );

  /**
   * Reset meeting state
   */
  const resetMeeting = useCallback(() => {
    setCurrentMeeting(null);
    setParticipants([]);
    setWebRTCState(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const value: MeetingContextState = {
    currentMeeting,
    participants,
    isLoading,
    error,
    webrtcState,
    setCurrentMeeting,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setWebRTCState,
    setError,
    resetMeeting,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
}

/**
 * useMeetingContext Hook
 */
export function useMeetingContext(): MeetingContextState {
  const context = useContext(MeetingContext);

  if (context === undefined) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }

  return context;
}
