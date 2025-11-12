/**
 * Browser Compatibility Banner Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrowserCompatibility } from '@/lib/onboarding/BrowserCompatibility';
import { UpgradeGuidance } from '@/types/onboarding';

export function BrowserCompatibilityBanner() {
  const [upgradeGuidance, setUpgradeGuidance] = useState<UpgradeGuidance | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const guidance = BrowserCompatibility.getUpgradeGuidance();
    setUpgradeGuidance(guidance);
  }, []);

  if (!upgradeGuidance || dismissed) {
    return null;
  }

  const urgencyColors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    low: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  const urgencyIcons = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600'
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b ${urgencyColors[upgradeGuidance.urgency]} p-4`}>
      <div className="max-w-7xl mx-auto flex items-start gap-4">
        <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${urgencyIcons[upgradeGuidance.urgency]}`} />

        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Browser Update Recommended
          </h3>
          <p className="text-sm mb-2">
            You're using {upgradeGuidance.browserName} {upgradeGuidance.currentVersion}.
            For the best experience with MeetSolis, we recommend upgrading to version {upgradeGuidance.recommendedVersion} or later.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => window.open(upgradeGuidance.downloadUrl, '_blank')}
          >
            Download Latest Version
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
