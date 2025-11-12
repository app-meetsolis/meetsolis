/**
 * Onboarding Types
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

export type OnboardingStep = 'welcome' | 'permissions' | 'profile' | 'first-meeting' | 'complete';

export interface OnboardingState {
  step: OnboardingStep;
  progress: number;
  completedSteps: string[];
  canSkip: boolean;
  timeEstimate: string;
  lastCompletedAt: Date;
}

export interface OnboardingStepConfig {
  id: string;
  required: boolean;
  timeEstimate: string;
  title: string;
  description: string;
}

export interface OnboardingComponent {
  showTooltip: boolean;
  highlightElement: boolean;
  blockInteraction: boolean;
  showProgress: boolean;
  allowSkip: boolean;
}

export interface DeviceTestResult {
  camera: {
    available: boolean;
    resolution: string;
    frameRate: number;
    error?: string;
  };
  microphone: {
    available: boolean;
    volume: number;
    quality: 'excellent' | 'good' | 'poor';
    error?: string;
  };
  speakers: {
    available: boolean;
    testPassed: boolean;
    error?: string;
  };
}

export interface BrowserCapabilities {
  webrtc: boolean;
  mediaDevices: boolean;
  screenShare: boolean;
  notifications: boolean;
  websockets: boolean;
  modernFeatures: boolean;
}

export interface OnboardingMetrics {
  stepCompletionRates: Record<string, number>;
  dropOffPoints: string[];
  timeToValue: number;
  supportTicketsGenerated: number;
  userSatisfactionScore: number;
  deviceIssuesEncountered: Record<string, number>;
}

export interface TroubleshootingGuide {
  issue: string;
  steps: string[];
  commonCauses: string[];
  supportLink?: string;
}

export interface UpgradeGuidance {
  browserName: string;
  currentVersion: string;
  recommendedVersion: string;
  downloadUrl: string;
  urgency: 'low' | 'medium' | 'high';
}
