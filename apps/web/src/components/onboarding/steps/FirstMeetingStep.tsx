/**
 * First Meeting Step Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Video, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FirstMeetingStepProps {
  onSave?: (data: MeetingData) => Promise<void>;
}

interface MeetingData {
  title: string;
  description?: string;
  scheduled_start?: string;
}

export function FirstMeetingStep({ onSave }: FirstMeetingStepProps) {
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meetingData, setMeetingData] = useState({
    title: 'My First Meeting',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    participants: ''
  });

  const handleCreateMeeting = async () => {
    setError(null);
    setIsCreating(true);

    try {
      // Combine date and time into ISO string for scheduled_start
      const scheduledStart = new Date(`${meetingData.date}T${meetingData.time}`).toISOString();

      const data: MeetingData = {
        title: meetingData.title,
        description: 'Demo meeting created during onboarding',
        scheduled_start: scheduledStart,
      };

      if (onSave) {
        await onSave(data);
      }

      setMeetingCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  if (meetingCreated) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Congratulations!
          </h3>
          <p className="text-gray-600">
            You've successfully set up your MeetSolis account.
            You're ready to host amazing video conferences!
          </p>
        </div>

        <div className="bg-primary-50 rounded-lg p-6 space-y-3">
          <h4 className="font-semibold text-primary-900">What's Next?</h4>
          <ul className="text-sm text-primary-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Invite team members to join your meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Explore the whiteboard and screen sharing features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Set up your calendar integration for easy scheduling</span>
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">
          Need help? Check out our <a href="/help" className="text-primary-600 hover:underline">Help Center</a> or reach out to support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your First Meeting
        </h3>
        <p className="text-gray-600">
          Let's test everything with a demo meeting. You can skip this and create your first real meeting later.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Meeting Title
            </div>
          </label>
          <Input
            type="text"
            placeholder="e.g., Team Standup"
            value={meetingData.title}
            onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </div>
            </label>
            <Input
              type="date"
              value={meetingData.date}
              onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </div>
            </label>
            <Input
              type="time"
              value={meetingData.time}
              onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Participants (Optional)
            </div>
          </label>
          <Input
            type="email"
            placeholder="email@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can add more participants later
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleCreateMeeting}
          disabled={isCreating || !meetingData.title}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating Meeting...
            </>
          ) : (
            'Create Demo Meeting'
          )}
        </Button>
      </div>

      <div className="bg-primary-50 rounded-lg p-4">
        <p className="text-sm text-primary-700">
          <strong>Tip:</strong> Once created, you'll get a unique meeting link that you can share with participants.
        </p>
      </div>
    </div>
  );
}
