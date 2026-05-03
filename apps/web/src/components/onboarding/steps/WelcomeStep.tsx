/**
 * Welcome Step Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { Brain, Users, MessageSquare, FileText } from 'lucide-react';

export function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to MeetSolis!
        </h3>
        <p className="text-gray-600">
          Let&apos;s get you started with a quick tour of the platform&apos;s
          main features.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary-50 rounded-lg">
          <Users className="w-8 h-8 text-primary-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Client Cards</h4>
          <p className="text-sm text-gray-600">
            Persistent memory for each coaching client — goals, history,
            breakthroughs
          </p>
        </div>

        <div className="p-4 bg-[#f0fdf9] rounded-lg">
          <FileText className="w-8 h-8 text-[#16a780] mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">
            Transcript Upload
          </h4>
          <p className="text-sm text-gray-600">
            Upload session notes or audio — MeetSolis transcribes and processes
            automatically
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">AI Summaries</h4>
          <p className="text-sm text-gray-600">
            Auto-generated session summaries, action items, and key discussion
            points
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <Brain className="w-8 h-8 text-orange-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">
            Solis Intelligence
          </h4>
          <p className="text-sm text-gray-600">
            Ask anything about any client&apos;s history — instant, cited
            answers
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Next steps:</strong> Add your first client, upload a session
          transcript, and let MeetSolis handle the rest. Setup takes under 2
          minutes.
        </p>
      </div>
    </div>
  );
}
