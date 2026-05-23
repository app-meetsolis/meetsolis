'use client';

/**
 * Coach Brief activation-window dropdown (Story 6.5).
 * Pro-only — Free coaches see disabled state + upgrade CTA.
 */

import Link from 'next/link';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const WINDOW_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
] as const;

interface Props {
  value: number;
  onChange: (minutes: number) => void;
  isPro: boolean;
  disabled?: boolean;
}

export function CoachBriefWindowSelect({
  value,
  onChange,
  isPro,
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'space-y-2',
          !isPro && 'opacity-50 pointer-events-none select-none'
        )}
      >
        <Label className="text-[13px] font-medium text-foreground">
          How far in advance should your Coach Brief appear?
        </Label>
        <Select
          value={String(value)}
          onValueChange={v => onChange(Number(v))}
          disabled={!isPro || disabled}
        >
          <SelectTrigger className="text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINDOW_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value} className="text-[13px]">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[12px] text-muted-foreground">
          Your brief auto-generates this many minutes before each session.
        </p>
      </div>
      {!isPro && (
        <p className="text-[12px] text-muted-foreground">
          <Link href="/pricing" className="text-primary hover:underline">
            Upgrade to Pro
          </Link>{' '}
          to unlock Coach Brief.
        </p>
      )}
    </div>
  );
}
