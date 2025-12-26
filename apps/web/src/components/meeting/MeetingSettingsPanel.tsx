/**
 * MeetingSettingsPanel Component
 * Settings panel for host to control meeting permissions and features
 *
 * Features:
 * - Toggle chat enabled/disabled
 * - Toggle private chat
 * - Toggle file uploads
 * - Host-only access
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface MeetingSettings {
  chat_enabled?: boolean;
  private_chat_enabled?: boolean;
  file_uploads_enabled?: boolean;
  allow_participant_screenshare?: boolean; // Story 2.5 AC 6
}

export interface MeetingSettingsPanelProps {
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
  currentSettings: MeetingSettings;
  onUpdateSettings: (settings: MeetingSettings) => Promise<void>;
}

export function MeetingSettingsPanel({
  meetingId,
  isOpen,
  onClose,
  currentSettings,
  onUpdateSettings,
}: MeetingSettingsPanelProps) {
  const [settings, setSettings] = useState<MeetingSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when currentSettings change
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleToggle = async (key: keyof MeetingSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);

    // Auto-save on toggle
    setIsSaving(true);
    try {
      // Story 2.5 AC 6: Screen share uses dedicated endpoint
      if (key === 'allow_participant_screenshare') {
        const response = await fetch(
          `/api/meetings/${meetingId}/screen-share-settings`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allowAll: !settings[key] }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update screen share settings');
        }
      } else {
        await onUpdateSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900 border-l border-gray-700 flex flex-col z-50',
        'shadow-2xl transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      role="dialog"
      aria-label="Meeting settings"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Meeting Settings</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="text-sm text-gray-400 mb-4">
          Control participant permissions for this meeting
        </div>

        {/* Chat Enabled */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <h3 className="text-white font-medium">Public Chat</h3>
            <p className="text-sm text-gray-400">
              Allow participants to send messages in public chat
            </p>
          </div>
          <button
            onClick={() => handleToggle('chat_enabled')}
            disabled={isSaving}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              settings.chat_enabled ? 'bg-blue-600' : 'bg-gray-600',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
            role="switch"
            aria-checked={settings.chat_enabled}
            aria-label="Toggle public chat"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.chat_enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Private Chat Enabled */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <h3 className="text-white font-medium">Private Chat</h3>
            <p className="text-sm text-gray-400">
              Allow participants to send private messages
            </p>
          </div>
          <button
            onClick={() => handleToggle('private_chat_enabled')}
            disabled={isSaving || !settings.chat_enabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              settings.private_chat_enabled && settings.chat_enabled
                ? 'bg-blue-600'
                : 'bg-gray-600',
              (isSaving || !settings.chat_enabled) &&
                'opacity-50 cursor-not-allowed'
            )}
            role="switch"
            aria-checked={settings.private_chat_enabled}
            aria-label="Toggle private chat"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.private_chat_enabled && settings.chat_enabled
                  ? 'translate-x-6'
                  : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* File Uploads Enabled */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <h3 className="text-white font-medium">File Uploads</h3>
            <p className="text-sm text-gray-400">
              Allow participants to share files in chat
            </p>
          </div>
          <button
            onClick={() => handleToggle('file_uploads_enabled')}
            disabled={isSaving || !settings.chat_enabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              settings.file_uploads_enabled && settings.chat_enabled
                ? 'bg-blue-600'
                : 'bg-gray-600',
              (isSaving || !settings.chat_enabled) &&
                'opacity-50 cursor-not-allowed'
            )}
            role="switch"
            aria-checked={settings.file_uploads_enabled}
            aria-label="Toggle file uploads"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.file_uploads_enabled && settings.chat_enabled
                  ? 'translate-x-6'
                  : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Screen Share for All - Story 2.5 AC 6 */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <h3 className="text-white font-medium">Participant Screen Share</h3>
            <p className="text-sm text-gray-400">
              Allow all participants to share their screen (host can always
              share)
            </p>
          </div>
          <button
            onClick={() => handleToggle('allow_participant_screenshare')}
            disabled={isSaving}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              settings.allow_participant_screenshare
                ? 'bg-blue-600'
                : 'bg-gray-600',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
            role="switch"
            aria-checked={settings.allow_participant_screenshare}
            aria-label="Toggle participant screen sharing"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settings.allow_participant_screenshare
                  ? 'translate-x-6'
                  : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {isSaving && (
          <div className="text-center text-sm text-blue-400">
            Saving changes...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 bg-gray-800 px-4 py-3">
        <div className="text-xs text-gray-400 text-center">
          Changes take effect immediately for all participants
        </div>
      </div>
    </div>
  );
}
