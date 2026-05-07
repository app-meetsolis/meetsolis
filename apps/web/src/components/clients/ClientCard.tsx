'use client';

import { Client } from '@meetsolis/shared';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ClientCardProps {
  client: Client;
  onEdit?: (_client: Client) => void;
  onDelete?: (_client: Client) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatLastSession(last: string | Date | null | undefined): string {
  if (!last) return null as unknown as string;
  try {
    const date = typeof last === 'string' ? parseISO(last) : last;
    return format(date, 'MMM d');
  } catch {
    return null as unknown as string;
  }
}

function formatSince(created: string | Date | null | undefined): string {
  if (!created) return '';
  try {
    const date = typeof created === 'string' ? parseISO(created) : created;
    return `Since ${format(date, 'MMM yyyy')}`;
  } catch {
    return '';
  }
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const router = useRouter();
  const initials = getInitials(client.name);
  const roleCompany =
    [client.role, client.company].filter(Boolean).join(' · ') || null;
  const hasSession = !!client.last_session_at;
  const lastSession = formatLastSession(client.last_session_at);
  const since = formatSince(client.created_at);

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/clients/${client.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative flex cursor-pointer flex-col rounded-[12px] bg-card
        shadow-card
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-card-hover
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* â"€â"€ Actions menu â"€â"€ */}
      {(onEdit || onDelete) && (
        <div
          className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={e => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Client actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  onClick={() => onDelete(client)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="p-6 flex flex-col gap-4">
        {/* â"€â"€ Identity row â"€â"€ */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[14px] font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold leading-tight text-foreground">
              {client.name}
            </p>
            {roleCompany && (
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {roleCompany}
              </p>
            )}
          </div>
        </div>

        {/* â"€â"€ Coaching goal â"€â"€ */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
            Current Goal
          </p>
          {client.goal ? (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-secondary-foreground">
              {client.goal}
            </p>
          ) : (
            <p className="text-[13px] italic text-muted-foreground/50">
              No coaching goal set
            </p>
          )}
        </div>

        {/* â"€â"€ Stats + status â"€â"€ */}
        <div className="border-t border-border pt-3.5 flex flex-col gap-2">
          {since && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{since}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {lastSession
                  ? `Last session ${lastSession}`
                  : 'No sessions yet'}
              </span>
            </div>
            {hasSession && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
