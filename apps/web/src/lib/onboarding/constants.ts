/**
 * Onboarding Constants
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { OnboardingStepConfig } from '@/types/onboarding';

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'welcome',
    required: true,
    timeEstimate: '30s',
    title: 'Welcome to MeetSolis',
    description: 'Quick introduction to the platform'
  },
  {
    id: 'permissions',
    required: true,
    timeEstimate: '1min',
    title: 'Device Setup',
    description: 'Test your camera and microphone'
  },
  {
    id: 'profile',
    required: false,
    timeEstimate: '2min',
    title: 'Profile Setup',
    description: 'Complete your profile information'
  },
  {
    id: 'first-meeting',
    required: false,
    timeEstimate: '3min',
    title: 'First Meeting',
    description: 'Create and test your first meeting'
  }
];

export const ONBOARDING_STORAGE_KEY = 'meetsolis_onboarding_state';

export const SUCCESS_METRICS = {
  COMPLETION_RATE_TARGET: 0.8, // >80%
  DEVICE_SETUP_SUCCESS_TARGET: 0.95, // >95%
  TIME_TO_FIRST_MEETING_TARGET: 180000, // <3 minutes in ms
  USER_SATISFACTION_TARGET: 4.5, // >4.5/5
  SUPPORT_TICKET_TARGET: 5 // <5 tickets/day
} as const;
