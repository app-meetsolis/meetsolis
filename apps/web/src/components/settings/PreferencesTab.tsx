'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Clock, Calendar, Shield, ExternalLink } from 'lucide-react';
import { CURATED_TIMEZONES, getAllTimezones } from '@/lib/constants/timezones';

interface Preferences {
  email_notifications_enabled: boolean;
  timezone: string;
}

const DATE_FORMATS = [
  { value: 'MDY', label: 'MM/DD/YYYY', example: '05/09/2026' },
  { value: 'DMY', label: 'DD/MM/YYYY', example: '09/05/2026' },
  { value: 'YMD', label: 'YYYY-MM-DD', example: '2026-05-09' },
];

const SESSION_DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '2 hours' },
];

async function fetchPreferences(): Promise<Preferences> {
  const res = await fetch('/api/user/preferences');
  if (!res.ok) throw new Error('Failed to load preferences');
  return res.json() as Promise<Preferences>;
}

async function savePreferences(patch: Partial<Preferences>): Promise<void> {
  const res = await fetch('/api/user/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Save failed');
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PreferencesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="rounded-[12px] border border-border bg-card p-5 h-36 animate-pulse"
        >
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          <div className="h-3 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function PreferencesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: fetchPreferences,
  });

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateFormat, setDateFormat] = useState('MDY');
  const [sessionDuration, setSessionDuration] = useState('60');

  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (data) {
      setEmailNotifs(data.email_notifications_enabled);
      setTimezone(data.timezone);
    }
  }, [data]);

  useEffect(() => {
    const df = localStorage.getItem('ms-date-format');
    const sd = localStorage.getItem('ms-session-duration');
    if (df) setDateFormat(df);
    if (sd) setSessionDuration(sd);
  }, []);

  const save = useCallback(
    async (patch: Partial<Preferences>) => {
      setSaving(true);
      try {
        await savePreferences(patch);
        await queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
        toast.success('Preferences saved');
      } catch {
        toast.error('Failed to save preferences');
      } finally {
        setSaving(false);
      }
    },
    [queryClient]
  );

  async function handleEmailToggle(checked: boolean) {
    setEmailNotifs(checked);
    await save({ email_notifications_enabled: checked });
  }

  async function handleTimezoneChange(value: string) {
    setTimezone(value);
    await save({ timezone: value });
  }

  async function applyBrowserTz() {
    setTimezone(browserTz);
    await save({ timezone: browserTz });
  }

  function handleDateFormat(value: string) {
    setDateFormat(value);
    localStorage.setItem('ms-date-format', value);
    toast.success('Date format updated');
  }

  function handleSessionDuration(value: string) {
    setSessionDuration(value);
    localStorage.setItem('ms-session-duration', value);
    toast.success('Default session duration updated');
  }

  const timezoneOptions = showAll
    ? getAllTimezones().map(tz => ({ value: tz, label: tz }))
    : CURATED_TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }));

  const showBrowserHint = data?.timezone === 'UTC' && browserTz !== 'UTC';

  if (isLoading) return <PreferencesLoadingSkeleton />;
  if (isError) {
    return (
      <div className="text-[13px] text-destructive">
        Failed to load preferences. Please refresh.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* Left column */}
      <div className="space-y-4">
        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="email-notifs"
                className="text-[13px] font-medium text-foreground"
              >
                Product updates and tips
              </Label>
              <p className="text-[12px] text-muted-foreground">
                New features, coaching tips, and platform updates.
              </p>
            </div>
            <Switch
              id="email-notifs"
              checked={emailNotifs}
              onCheckedChange={handleEmailToggle}
              disabled={saving}
            />
          </div>
          <div className="flex items-start justify-between gap-4 pt-1 border-t border-border">
            <div className="space-y-1">
              <p className="text-[13px] font-medium text-foreground">
                Transactional emails
              </p>
              <p className="text-[12px] text-muted-foreground">
                Receipts, payment alerts, security notices. Always on.
              </p>
            </div>
            <Switch checked disabled className="opacity-50" />
          </div>
        </SectionCard>

        {/* Timezone */}
        <SectionCard icon={Clock} title="Timezone">
          {showBrowserHint && (
            <div className="flex items-center gap-2 bg-muted rounded-[8px] px-3 py-2">
              <span className="text-[13px] text-muted-foreground">
                Detected:{' '}
                <strong className="text-foreground">{browserTz}</strong>
              </span>
              <button
                className="ml-auto text-[12px] text-primary hover:underline"
                onClick={() => void applyBrowserTz()}
                disabled={saving}
              >
                Use this?
              </button>
            </div>
          )}
          <Select
            value={timezone}
            onValueChange={v => void handleTimezoneChange(v)}
            disabled={saving}
          >
            <SelectTrigger className="text-[13px]">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {timezoneOptions.map(opt => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-[13px]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showAll && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-[12px]"
              onClick={() => setShowAll(true)}
            >
              Show all timezones
            </Button>
          )}
          <p className="text-[12px] text-muted-foreground">
            Used for displaying session dates and times throughout the app.
          </p>
        </SectionCard>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Date format */}
        <SectionCard icon={Calendar} title="Date format">
          <Select value={dateFormat} onValueChange={handleDateFormat}>
            <SelectTrigger className="text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map(f => (
                <SelectItem
                  key={f.value}
                  value={f.value}
                  className="text-[13px]"
                >
                  {f.label}
                  <span className="ml-2 text-muted-foreground text-[11px]">
                    e.g. {f.example}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[12px] text-muted-foreground">
            Controls how dates appear in session timelines and exports.
          </p>
        </SectionCard>

        {/* Session defaults */}
        <SectionCard icon={Clock} title="Coaching session defaults">
          <div className="space-y-1">
            <Label className="text-[13px] font-medium text-foreground">
              Default session duration
            </Label>
            <p className="text-[12px] text-muted-foreground">
              Pre-fills when you log a new session.
            </p>
          </div>
          <Select value={sessionDuration} onValueChange={handleSessionDuration}>
            <SelectTrigger className="text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_DURATIONS.map(d => (
                <SelectItem
                  key={d.value}
                  value={d.value}
                  className="text-[13px]"
                >
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard icon={Shield} title="Data & privacy">
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  Privacy policy
                </p>
                <p className="text-[12px] text-muted-foreground">
                  How we collect and use your data
                </p>
              </div>
              <a
                href="https://meetsolis.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[12px] text-primary hover:underline shrink-0"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  Data export
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Download all your session data
                </p>
              </div>
              <span className="text-[12px] text-muted-foreground">
                Coming soon
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  Delete account
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Permanently remove your account
                </p>
              </div>
              <a
                href="mailto:support@meetsolis.com?subject=Account deletion request"
                className="flex items-center gap-1 text-[12px] text-destructive hover:underline shrink-0"
              >
                Request <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
