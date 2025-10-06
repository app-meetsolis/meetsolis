/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent management with granular controls
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { analytics } from '@/lib/analytics';
import type { ConsentPreferences } from '@meetsolis/shared';

const CONSENT_STORAGE_KEY = 'cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!savedConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(savedConsent) as ConsentPreferences;
        setPreferences(saved);
        applyConsent(saved);
      } catch (error) {
        console.error('[CookieConsent] Failed to parse saved consent:', error);
        setShowBanner(true);
      }
    }
  }, []);

  /**
   * Apply consent preferences to analytics services
   */
  const applyConsent = (prefs: ConsentPreferences) => {
    // Enable analytics if user consented
    analytics.setConsent(prefs.analytics);
  };

  /**
   * Save consent preferences
   */
  const saveConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    applyConsent(prefs);
    setShowBanner(false);
    setShowPreferences(false);

    // Track consent decision (only if analytics is enabled)
    if (prefs.analytics) {
      analytics.track('cookie_consent_updated', {
        analytics: prefs.analytics,
        marketing: prefs.marketing,
      });
    }
  };

  /**
   * Accept all cookies
   */
  const acceptAll = () => {
    const newPrefs: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(newPrefs);
  };

  /**
   * Accept only necessary cookies
   */
  const acceptNecessary = () => {
    const newPrefs: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(newPrefs);
  };

  /**
   * Show preferences modal
   */
  const showPreferencesModal = () => {
    setShowPreferences(true);
  };

  /**
   * Save custom preferences
   */
  const saveCustomPreferences = () => {
    saveConsent(preferences);
  };

  /**
   * Toggle preference
   */
  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main consent banner */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
          <div className="container max-w-screen-xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  We value your privacy
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to improve your experience, analyze site
                  traffic, and personalize content. You can choose which types
                  of cookies to allow.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={acceptNecessary} variant="outline" size="sm">
                  Necessary Only
                </Button>
                <Button
                  onClick={showPreferencesModal}
                  variant="outline"
                  size="sm"
                >
                  Customize
                </Button>
                <Button onClick={acceptAll} size="sm">
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Cookie Preferences</h2>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Necessary Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies are essential for the website to function
                    properly. They enable core functionality such as security,
                    authentication, and accessibility.
                  </p>
                </div>
                <div className="ml-4">
                  <Button disabled variant="outline" size="sm">
                    Always Active
                  </Button>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us understand how you use our website,
                    which pages you visit most often, and how we can improve
                    your experience.
                  </p>
                </div>
                <div className="ml-4">
                  <Button
                    onClick={() => togglePreference('analytics')}
                    variant={preferences.analytics ? 'default' : 'outline'}
                    size="sm"
                  >
                    {preferences.analytics ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between pb-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Marketing Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies are used to deliver personalized
                    advertisements and measure the effectiveness of our
                    marketing campaigns.
                  </p>
                </div>
                <div className="ml-4">
                  <Button
                    onClick={() => togglePreference('marketing')}
                    variant={preferences.marketing ? 'default' : 'outline'}
                    size="sm"
                  >
                    {preferences.marketing ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={acceptNecessary}
                variant="outline"
                className="flex-1"
              >
                Reject All
              </Button>
              <Button onClick={saveCustomPreferences} className="flex-1">
                Save Preferences
              </Button>
              <Button onClick={acceptAll} className="flex-1">
                Accept All
              </Button>
            </div>

            {/* Privacy Policy Link */}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              For more information, read our{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/cookies" className="underline hover:text-foreground">
                Cookie Policy
              </a>
              .
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
