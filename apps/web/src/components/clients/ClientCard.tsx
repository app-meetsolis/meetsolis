/**
 * ClientCard Component
 * v3: Shows goal, last session date — replaces tags/last meeting
 */

'use client';

import { Client } from '@meetsolis/shared';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Building2,
  Calendar,
  MoreVertical,
  Pencil,
  Target,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientCardProps {
  client: Client;
  onEdit?: (_client: Client) => void;
  onDelete?: (_client: Client) => void;
}

function formatLastSession(
  lastSessionAt: string | Date | null | undefined
): string {
  if (!lastSessionAt) return 'No sessions yet';
  try {
    const date =
      typeof lastSessionAt === 'string'
        ? parseISO(lastSessionAt)
        : lastSessionAt;
    return `Last session: ${formatDistanceToNow(date, { addSuffix: true })}`;
  } catch {
    return 'No sessions yet';
  }
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const router = useRouter();

  const roleCompanyText =
    [client.role, client.company].filter(Boolean).join(' at ') || null;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      className="group relative cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/clients/${client.id}`);
        }
      }}
    >
      {/* Actions Menu */}
      {(onEdit || onDelete) && (
        <div
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleMenuClick}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A1A]"
                aria-label="Client actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
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
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
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

      {/* Client Name */}
      <h3 className="mb-1 text-xl font-bold text-[#1A1A1A] group-hover:text-[#001F3F]">
        {client.name}
      </h3>

      {/* Role / Company */}
      {roleCompanyText && (
        <div className="mb-3 flex items-center gap-2 text-sm text-[#6B7280]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>{roleCompanyText}</span>
        </div>
      )}

      {/* Coaching Goal */}
      {client.goal && (
        <div className="mb-3 flex items-start gap-2 text-sm text-[#374151]">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]" />
          <span className="line-clamp-2">{client.goal}</span>
        </div>
      )}

      {/* Last Session */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Calendar className="h-4 w-4 shrink-0" />
        <span>{formatLastSession(client.last_session_at)}</span>
      </div>
    </div>
  );
}
