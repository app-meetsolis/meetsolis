/**
 * Welcome Step Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { Video, Users, MessageSquare, Calendar } from 'lucide-react';

export function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to MeetSolis!
        </h3>
        <p className="text-gray-600">
          Let's get you started with a quick tour of the platform's main features.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary-50 rounded-lg">
          <Video className="w-8 h-8 text-primary-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">HD Video Calls</h4>
          <p className="text-sm text-gray-600">
            Crystal-clear video conferences with up to 100 participants
          </p>
        </div>

        <div className="p-4 bg-teal-50 rounded-lg">
          <Users className="w-8 h-8 text-teal-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Team Collaboration</h4>
          <p className="text-sm text-gray-600">
            Work together with shared whiteboards and screen sharing
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">AI Summaries</h4>
          <p className="text-sm text-gray-600">
            Automatic meeting notes and action items powered by AI
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <Calendar className="w-8 h-8 text-orange-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Easy Scheduling</h4>
          <p className="text-sm text-gray-600">
            Integrate with your calendar and send invites effortlessly
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Next steps:</strong> We'll help you set up your devices, create your profile,
          and schedule your first meeting. The whole process takes less than 5 minutes!
        </p>
      </div>
    </div>
  );
}
