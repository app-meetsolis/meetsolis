/**
 * Permissions Step Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState, useEffect } from 'react';
import { Camera, Mic, Volume2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeviceTestingWizard } from '@/lib/onboarding/DeviceTestingWizard';
import { DeviceTestResult, TroubleshootingGuide } from '@/types/onboarding';

export function PermissionsStep() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<DeviceTestResult | null>(null);
  const [troubleshooting, setTroubleshooting] = useState<TroubleshootingGuide[]>([]);
  const [wizard] = useState(() => new DeviceTestingWizard());

  const runDeviceTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTroubleshooting([]);

    try {
      const result = await wizard.testDevices();
      setTestResult(result);

      const guides = wizard.generateTroubleshootingGuide(result);
      setTroubleshooting(guides);
    } catch (error) {
      console.error('Device test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const renderDeviceStatus = (
    icon: React.ReactNode,
    label: string,
    available: boolean,
    details?: string,
    quality?: string
  ) => {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-gray-600">{icon}</div>
          <div>
            <p className="font-medium text-gray-900">{label}</p>
            {details && <p className="text-sm text-gray-600">{details}</p>}
            {quality && (
              <p className={`text-xs font-medium ${
                quality === 'excellent' ? 'text-green-600' :
                quality === 'good' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Quality: {quality}
              </p>
            )}
          </div>
        </div>
        <div>
          {available ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Device Setup
        </h3>
        <p className="text-gray-600">
          Let's make sure your camera and microphone are working properly.
        </p>
      </div>

      {!testResult && !testing && (
        <div className="text-center py-8">
          <Camera className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">
            Click the button below to test your devices. We'll check your camera,
            microphone, and speakers to ensure everything is working correctly.
          </p>
          <Button onClick={runDeviceTest} size="lg">
            Test My Devices
          </Button>
        </div>
      )}

      {testing && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Testing your devices...</p>
        </div>
      )}

      {testResult && !testing && (
        <div className="space-y-4">
          {renderDeviceStatus(
            <Camera className="w-6 h-6" />,
            'Camera',
            testResult.camera.available,
            testResult.camera.resolution !== 'N/A' ? `${testResult.camera.resolution} @ ${testResult.camera.frameRate}fps` : undefined
          )}

          {renderDeviceStatus(
            <Mic className="w-6 h-6" />,
            'Microphone',
            testResult.microphone.available,
            testResult.microphone.available ? `Volume: ${testResult.microphone.volume}%` : undefined,
            testResult.microphone.quality
          )}

          {renderDeviceStatus(
            <Volume2 className="w-6 h-6" />,
            'Speakers',
            testResult.speakers.available
          )}

          {troubleshooting.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Troubleshooting Tips
                  </h4>
                  {troubleshooting.map((guide, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <p className="font-medium text-yellow-900 mb-1">{guide.issue}</p>
                      <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button onClick={runDeviceTest} variant="outline">
              Test Again
            </Button>
          </div>
        </div>
      )}

      <div className="bg-primary-50 rounded-lg p-4">
        <p className="text-sm text-primary-700">
          <strong>Privacy Note:</strong> Your device permissions are only used during meetings.
          We never record or store any audio or video without your explicit consent.
        </p>
      </div>
    </div>
  );
}
