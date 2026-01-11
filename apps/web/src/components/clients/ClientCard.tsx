/**
 * ClientCard Component
 * Story 2.2: Client Dashboard UI - Task 2: ClientCard Component
 * Story 2.3: Add/Edit Client Modal - Task 8 (Edit button)
 *
 * Displays individual client information in a card format with:
 * - Client name, role/company, last meeting date
 * - Active projects count badge (meetings in last 30 days)
 * - Hover effect (lift and shadow)
 * - Click to navigate to client detail page
 * - Edit button (Story 2.3)
 */

'use client';

import { Client } from '@meetsolis/shared';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Pencil } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onEdit?: (_client: Client) => void;
}

/**
 * Calculate active projects count (meetings in last 30 days)
 * Note: Placeholder until Epic 3 implements meetings table
 */
function getActiveProjectsCount(_client: Client): number {
  // TODO: Replace with actual count from meetings table in Epic 3
  // For now, return 0 as meetings table doesn't exist yet
  return 0;
}

/**
 * Format last meeting date
 */
function formatLastMeeting(
  lastMeetingAt: string | Date | null | undefined
): string {
  if (!lastMeetingAt) {
    return 'No meetings yet';
  }

  try {
    const date =
      typeof lastMeetingAt === 'string'
        ? parseISO(lastMeetingAt)
        : lastMeetingAt;
    return `Last meeting: ${formatDistanceToNow(date, { addSuffix: true })}`;
  } catch (error) {
    console.error('Failed to parse last_meeting_at:', error);
    return 'No meetings yet';
  }
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
  const router = useRouter();
  const activeProjects = getActiveProjectsCount(client);

  // Format role and company display
  const roleCompanyText =
    [client.role, client.company].filter(Boolean).join(' at ') ||
    'No role specified';

  /**
   * Handle edit button click
   * Prevent card navigation when edit is clicked
   */
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
      <h3 className="mb-2 text-xl font-bold text-[#1A1A1A] group-hover:text-[#001F3F]">
        {client.name}
      </h3>

      {/* Role / Company */}
      <div className="mb-3 flex items-center gap-2 text-sm text-[#6B7280]">
        <Building2 className="h-4 w-4" />
        <span>{roleCompanyText}</span>
      </div>

      {/* Last Meeting Date */}
      <div className="mb-3 flex items-center gap-2 text-sm text-[#6B7280]">
        <Calendar className="h-4 w-4" />
        <span>{formatLastMeeting(client.last_meeting_at)}</span>
      </div>

      {/* Active Projects Badge */}
      {activeProjects > 0 && (
        <Badge
          variant="secondary"
          className="bg-[#F3F4F6] text-[11px] uppercase tracking-wide"
        >
          {activeProjects} Active{' '}
          {activeProjects === 1 ? 'Project' : 'Projects'}
        </Badge>
      )}
    </div>
  );
}
