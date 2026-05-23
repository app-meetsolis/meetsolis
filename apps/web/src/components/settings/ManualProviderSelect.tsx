'use client';

/**
 * Manual upload transcription engine dropdown (Story 6.5).
 * Available to all tiers — bot sessions always use Gladia, this only affects manual uploads.
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ManualTranscriptionProvider } from '@meetsolis/shared';

const PROVIDER_OPTIONS: {
  value: ManualTranscriptionProvider;
  label: string;
}[] = [
  { value: 'deepgram', label: 'Deepgram Nova-2 (default, faster)' },
  { value: 'gladia', label: 'Gladia (better speaker detection)' },
];

interface Props {
  value: ManualTranscriptionProvider;
  onChange: (provider: ManualTranscriptionProvider) => void;
  disabled?: boolean;
}

export function ManualProviderSelect({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-medium text-foreground">
        Transcription engine for manual uploads
      </Label>
      <Select
        value={value}
        onValueChange={v => onChange(v as ManualTranscriptionProvider)}
        disabled={disabled}
      >
        <SelectTrigger className="text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROVIDER_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} className="text-[13px]">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[12px] text-muted-foreground">
        Which engine should MeetSolis use when you manually upload audio? This
        does not affect auto-transcription, which always uses Gladia.
      </p>
    </div>
  );
}
