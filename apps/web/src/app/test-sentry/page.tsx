/**
 * Sentry Test Page
 * Simple page to test Sentry error tracking integration
 *
 * DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT
 */

'use client';

import { useState } from 'react';
import { logWebRTCError, setUserContext } from '@/lib/monitoring/sentry';

export default function TestSentryPage() {
  const [status, setStatus] = useState<string>('');

  const testClientError = () => {
    setStatus('Sending test error to Sentry...');

    try {
      // Set user context
      setUserContext('test-user-123', 'test@example.com', 'Test User');

      // Log a test WebRTC error
      logWebRTCError(new Error('Test WebRTC error from test page'), {
        meetingId: 'test-meeting-abc123',
        userId: 'test-user-123',
        errorCode: 'TEST_ERROR',
        connectionState: 'testing',
        iceConnectionState: 'testing',
      });

      setStatus(
        '✅ Test error sent successfully! Check your Sentry dashboard.'
      );
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const testThrowError = () => {
    setStatus('Throwing uncaught error...');
    // This will be caught by Sentry's global error handler
    throw new Error('Test uncaught error for Sentry');
  };

  const testConsoleError = () => {
    setStatus('Logging console error...');
    console.error('Test console error for Sentry', {
      testData: 'This is a test',
      timestamp: new Date().toISOString(),
    });
    setStatus('✅ Console error logged. Check browser console and Sentry.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 Sentry Integration Test
            </h1>
            <p className="text-gray-600">
              Test your Sentry error tracking integration
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-700">
                ⚠️ <strong>Important:</strong> Delete this page before deploying
                to production!
                <br />
                File:{' '}
                <code className="text-xs bg-yellow-100 px-1 rounded">
                  apps/web/src/app/test-sentry/page.tsx
                </code>
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Test Options:
              </h2>

              <button
                onClick={testClientError}
                className="w-full mb-3 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                1. Test WebRTC Error (Recommended)
              </button>

              <button
                onClick={testConsoleError}
                className="w-full mb-3 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                2. Test Console Error
              </button>

              <button
                onClick={testThrowError}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                3. Test Uncaught Error (Will crash page)
              </button>
            </div>

            {status && (
              <div
                className={`p-4 rounded-lg ${
                  status.includes('✅')
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : status.includes('❌')
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                <p className="font-medium">{status}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ✅ Verification Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click one of the test buttons above</li>
              <li>Open your browser&apos;s developer console (F12)</li>
              <li>Check for any errors or warnings</li>
              <li>
                Go to{' '}
                <a
                  href="https://sentry.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  sentry.io
                </a>
              </li>
              <li>Navigate to your project → Issues</li>
              <li>Verify the test error appears within ~30 seconds</li>
              <li>Check that the error includes WebRTC context data</li>
            </ol>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📊 Current Configuration:
            </h3>
            <div className="bg-gray-50 rounded p-4 font-mono text-sm">
              <div className="mb-2">
                <span className="text-gray-600">Environment:</span>{' '}
                <span className="font-semibold">{process.env.NODE_ENV}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">Sentry DSN:</span>{' '}
                <span
                  className={
                    process.env.NEXT_PUBLIC_SENTRY_DSN
                      ? 'text-green-600 font-semibold'
                      : 'text-red-600 font-semibold'
                  }
                >
                  {process.env.NEXT_PUBLIC_SENTRY_DSN
                    ? '✅ Configured'
                    : '❌ Not configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
