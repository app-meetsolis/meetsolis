/**
 * Story 7.7 — Client Card Header.
 *
 * LinkedIn-style: avatar + identity + stats bar + goal.
 *
 * Layout:
 *   [80x80 avatar]   {Name (inline-editable)}              [Edit] [...] (existing buttons own this)
 *                    {Role} · {Company} (inline-editable)
 *                    Together X months · Y sessions · Next: date|—
 *                    Goal: "..." (inline-editable)
 *
 * Name/Role/Company/Goal inline editing → PATCH /api/clients/[id] (existing route).
 */

'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Building2, Calendar, Layers, Target } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@meetsolis/shared';
import { ClickToEdit } from './ClickToEdit';
import { AvatarUpload } from './AvatarUpload';

interface Props {
  client: Client;
  sessionCount: number;
  nextSessionAt: string | null;
}

interface ClientPatch {
  name?: string;
  role?: string;
  company?: string;
  goal?: string;
}

function monthsBetween(startIso: string | null | undefined): number | null {
  if (!startIso) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const days = (now.getTime() - start.getTime()) / 86_400_000;
  return Math.max(0, Math.floor(days / 30));
}

export function ClientHeader({ client, sessionCount, nextSessionAt }: Props) {
  const queryClient = useQueryClient();

  const patchMutation = useMutation({
    mutationFn: async (patch: ClientPatch) => {
      const r = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
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

  const togetherMonths = useMemo(
    () => monthsBetween(client.start_date as string | null | undefined),
    [client.start_date]
  );

  const roleCompany =
    [client.role, client.company].filter(Boolean).join(' · ') || null;

  const nextLabel = nextSessionAt
    ? format(parseISO(nextSessionAt), 'MMM d')
    : '—';

  return (
    <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
      <div className="flex items-start gap-4">
        <AvatarUpload
          clientId={client.id}
          clientName={client.name}
          avatarUrl={client.avatar_url ?? null}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[22px] font-bold tracking-[-0.02em] text-foreground leading-tight">
              <ClickToEdit
                value={client.name}
                onSave={value =>
                  value ? patchMutation.mutate({ name: value }) : null
                }
                ariaLabel="Client name"
              />
            </div>
            {client.is_demo && (
              <span
                title="Demo — explore MeetSolis with this sample client"
                className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/55"
              >
                Demo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[12px] text-foreground/45">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="flex-1 max-w-md">
              {roleCompany ? (
                <ClickToEdit
                  value={roleCompany}
                  onSave={value => {
                    // value is "Role · Company"; split first " · " only
                    const parts = value.split('·').map(p => p.trim());
                    patchMutation.mutate({
                      role: parts[0] ?? '',
                      company: parts.slice(1).join(' · ') ?? '',
                    });
                  }}
                  ariaLabel="Role and company"
                  placeholder="Add role · company…"
                />
              ) : (
                <ClickToEdit
                  value=""
                  onSave={value => patchMutation.mutate({ role: value })}
                  ariaLabel="Role and company"
                  placeholder="Add role · company…"
                />
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] text-primary">
              <Target className="h-3 w-3 shrink-0" />
              <ClickToEdit
                value={client.goal ?? ''}
                onSave={value => patchMutation.mutate({ goal: value })}
                ariaLabel="Coaching goal"
                placeholder="Add a coaching goal…"
              />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4 mt-4 border-t border-border flex-wrap">
        {togetherMonths !== null && (
          <Stat
            label="Together"
            value={`${togetherMonths} ${togetherMonths === 1 ? 'month' : 'months'}`}
          />
        )}
        <Stat
          icon={<Layers className="h-3.5 w-3.5 text-foreground/30" />}
          label="sessions"
          value={sessionCount}
        />
        <Stat
          icon={<Calendar className="h-3.5 w-3.5 text-foreground/30" />}
          label="Next"
          value={nextLabel}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      {icon}
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-foreground/35">{label}</span>
    </div>
  );
}
