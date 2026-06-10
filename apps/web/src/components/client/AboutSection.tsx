/**
 * Story 7.7 — ABOUT section (private coach notes about the client).
 *
 * Collapsed by default if any field non-null; expanded if all null (gentle prompt).
 * Inline-edits hit PATCH /api/clients/[id]/about.
 *
 * Fields:
 * - Industry (free text)
 * - Company size (Shadcn Select, 6 options)
 * - Start date (date picker — simple <input type="date">)
 * - Private notes (multi-line)
 */

'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  CLIENT_COMPANY_SIZES,
  type ClientCompanySize,
  type Client,
} from '@meetsolis/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClickToEdit } from './ClickToEdit';

interface Props {
  client: Client;
}

interface AboutPatch {
  industry?: string | null;
  company_size?: ClientCompanySize | null;
  about_notes?: string | null;
  start_date?: string | null;
}

const COMPANY_SIZE_LABELS: Record<ClientCompanySize, string> = {
  solo: 'Solo (1)',
  '2-10': '2 – 10',
  '11-50': '11 – 50',
  '51-200': '51 – 200',
  '201-1000': '201 – 1,000',
  '1000+': '1,000+',
};

export function AboutSection({ client }: Props) {
  const queryClient = useQueryClient();

  const allEmpty = useMemo(
    () =>
      !client.industry &&
      !client.company_size &&
      !client.about_notes &&
      !client.start_date,
    [
      client.industry,
      client.company_size,
      client.about_notes,
      client.start_date,
    ]
  );

  const [open, setOpen] = useState(allEmpty);

  const patchMutation = useMutation({
    mutationFn: async (patch: AboutPatch) => {
      const r = await fetch(`/api/clients/${client.id}/about`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Save failed');
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', client.id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="rounded-[12px] bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-foreground/40" />
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
            About
          </h2>
          <span className="text-[11px] text-foreground/35">
            Private — not shared with client
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-foreground/30" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground/30" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Industry">
            <ClickToEdit
              value={client.industry ?? ''}
              onSave={v =>
                patchMutation.mutate({ industry: v.trim() === '' ? null : v })
              }
              ariaLabel="Industry"
              placeholder="e.g. Technology, Healthcare…"
            />
          </Field>

          <Field label="Company size">
            <Select
              value={client.company_size ?? undefined}
              onValueChange={(v: string) =>
                patchMutation.mutate({
                  company_size: v as ClientCompanySize,
                })
              }
            >
              <SelectTrigger className="h-8 text-[13px] bg-background border-border">
                <SelectValue placeholder="Choose size…" />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_COMPANY_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {COMPANY_SIZE_LABELS[size]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Coaching since">
            <input
              type="date"
              value={
                client.start_date
                  ? (client.start_date as string).substring(0, 10)
                  : ''
              }
              onChange={e =>
                patchMutation.mutate({
                  start_date: e.target.value || null,
                })
              }
              className="h-8 w-full bg-background border border-border rounded-md px-2 text-[13px] text-foreground"
            />
          </Field>

          <Field label="Private notes" wide>
            <ClickToEdit
              value={client.about_notes ?? ''}
              onSave={v =>
                patchMutation.mutate({
                  about_notes: v.trim() === '' ? null : v,
                })
              }
              ariaLabel="Private notes"
              placeholder="Anything else you want to remember…"
              multiline
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <div className="text-[11px] uppercase tracking-wider text-foreground/40 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
