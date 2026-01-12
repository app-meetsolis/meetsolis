/**
 * ClientDetailHeader Component
 * Story 2.6: Client Detail View (Enhanced) - Task 3
 *
 * Header for client detail page with:
 * - Back navigation
 * - Client name and role/company
 * - Tags display
 * - Action buttons (Prepare for Meeting, Edit, Delete)
 */

'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Client } from '@meetsolis/shared';

interface ClientDetailHeaderProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientDetailHeader({
  client,
  onEdit,
  onDelete,
}: ClientDetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/clients');
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Button>

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Client Info */}
        <div className="flex-1 min-w-0">
          {/* Client Name */}
          <h1 className="text-2xl font-bold text-gray-900 break-words">
            {client.name}
          </h1>

          {/* Role / Company */}
          {(client.role || client.company) && (
            <p className="text-sm text-gray-600 mt-1">
              {[client.role, client.company].filter(Boolean).join(' at ')}
            </p>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {client.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Prepare for Meeting Button - Disabled for now (Epic 3) */}
          <Button disabled className="flex-shrink-0">
            Prepare for Meeting
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit Client</DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
