/**
 * Profile Step Component
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

'use client';

import { useState } from 'react';
import { User, Briefcase, Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileStepProps {
  onSave?: (data: ProfileData) => Promise<void>;
}

interface ProfileData {
  display_name: string;
  title: string;
  timezone: string;
  bio: string;
}

export function ProfileStep({ onSave }: ProfileStepProps) {
  const [profile, setProfile] = useState({
    displayName: '',
    title: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export save handler so OnboardingContainer can call it
  if (onSave && typeof window !== 'undefined') {
    (window as any).__profileStepSave = async () => {
      setError(null);
      setIsSaving(true);
      try {
        const data: ProfileData = {
          display_name: profile.displayName,
          title: profile.title,
          timezone: profile.timezone,
          bio: profile.bio,
        };
        await onSave(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save profile');
        throw err;
      } finally {
        setIsSaving(false);
      }
    };
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Your Profile
        </h3>
        <p className="text-gray-600">
          Help others get to know you better (this step is optional).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Display Name
            </div>
          </label>
          <Input
            type="text"
            placeholder="How should we call you?"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Title
            </div>
          </label>
          <Input
            type="text"
            placeholder="e.g., Product Manager"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Timezone
            </div>
          </label>
          <Input
            type="text"
            value={profile.timezone}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-detected from your system
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (Optional)
          </label>
          <Textarea
            placeholder="Tell us a bit about yourself..."
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-primary-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Saving profile...</span>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          You can update this information anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}
