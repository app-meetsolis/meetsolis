/**
 * Waiting Room Page
 * Pre-call device testing before joining meeting
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DeviceTestWizard } from '@/components/meeting';

interface WaitingRoomPageProps {
  params: {
    id: string;
  };
}

export default function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isJoining, setIsJoining] = useState(false);

  /**
   * Handle device test completion
   */
  const handleDeviceTestComplete = async (preferences: {
    cameraId: string;
    microphoneId: string;
    speakerId: string;
  }) => {
    console.log('Device preferences saved:', preferences);
    setIsJoining(true);

    // Join the meeting
    router.push(`/meeting/${params.id}`);
  };

  /**
   * Handle skip device test
   */
  const handleSkip = () => {
    router.push(`/meeting/${params.id}`);
  };

  /**
   * Handle back/cancel
   */
  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  if (!user) {
    router.push(`/sign-in?redirect_url=/meeting/${params.id}/waiting-room`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold">
              Setup Your Devices
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Test your camera, microphone, and speakers before joining
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cancel and return to dashboard"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Device Test Wizard */}
      <div className="flex-1 flex items-center justify-center p-6">
        {isJoining ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4" />
            <p className="text-lg">Joining meeting...</p>
          </div>
        ) : (
          <DeviceTestWizard
            onComplete={handleDeviceTestComplete}
            onSkip={handleSkip}
            className="w-full"
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <p className="text-center text-gray-400 text-sm">
          Meeting ID: {params.id.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
