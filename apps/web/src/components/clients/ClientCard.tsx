'use client';

import { Client } from '@meetsolis/shared';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Pencil, Target, CheckSquare } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onEdit?: (_client: Client) => void;
  pendingActionsCount?: number;
}

function formatLastSession(
  lastMeetingAt: string | Date | null | undefined
): string {
  if (!lastMeetingAt) return 'No sessions yet';
  try {
    const date =
      typeof lastMeetingAt === 'string'
        ? parseISO(lastMeetingAt)
        : lastMeetingAt;
    return `Last session: ${formatDistanceToNow(date, { addSuffix: true })}`;
  } catch {
    return 'No sessions yet';
  }
}

export function ClientCard({
  client,
  onEdit,
  pendingActionsCount = 0,
}: ClientCardProps) {
  const router = useRouter();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(client);
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
      {/* Edit Button */}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleEditClick}
          aria-label="Edit client"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {/* Client Name */}
      <h3 className="mb-1 text-xl font-bold text-[#1A1A1A] group-hover:text-[#001F3F]">
        {client.name}
      </h3>

      {/* Role / Company */}
      {(client.role || client.company) && (
        <p className="mb-3 text-sm text-[#6B7280]">
          {[client.role, client.company].filter(Boolean).join(' at ')}
        </p>
      )}

      {/* Coaching Goal */}
      {client.goal && (
        <div className="mb-3 flex items-start gap-2 text-sm text-[#1A1A1A]">
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6B7280]" />
          <span className="line-clamp-2">{client.goal}</span>
        </div>
      )}

      {/* Last Session */}
      <div className="mb-3 flex items-center gap-2 text-sm text-[#6B7280]">
        <Calendar className="h-4 w-4" />
        <span>{formatLastSession(client.last_meeting_at)}</span>
      </div>

      {/* Pending Actions */}
      {pendingActionsCount > 0 && (
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[#F59E0B]" />
          <Badge
            variant="secondary"
            className="bg-amber-50 text-amber-700 text-[11px]"
          >
            {pendingActionsCount} pending{' '}
            {pendingActionsCount === 1 ? 'action' : 'actions'}
          </Badge>
        </div>
      )}
    </div>
  );
}
