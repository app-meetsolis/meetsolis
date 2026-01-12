/**
 * ActionItemCard Component
 * Story 2.6: Client Detail View (Enhanced) - Task 9
 *
 * Displays a single action item with:
 * - Checkbox for completion status
 * - Description (strikethrough if completed)
 * - Due date badge (red if overdue)
 * - Edit/Delete actions on hover
 * - Keyboard navigation support
 */

'use client';

import { useState } from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientActionItem } from '@meetsolis/shared';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActionItemCardProps {
  actionItem: ClientActionItem;
  onToggle: (id: string) => void;
  onEdit: (actionItem: ClientActionItem) => void;
  onDelete: (id: string) => void;
}

export function ActionItemCard({
  actionItem,
  onToggle,
  onEdit,
  onDelete,
}: ActionItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDueDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const isDueDateOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    try {
      return isPast(parseISO(dateString)) && !actionItem.completed;
    } catch {
      return false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      onDelete(actionItem.id);
    }
  };

  const isOverdue =
    actionItem.due_date && isDueDateOverdue(actionItem.due_date);

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Checkbox */}
      <Checkbox
        checked={actionItem.completed}
        onCheckedChange={() => onToggle(actionItem.id)}
        aria-label="Mark action item as complete"
        aria-checked={actionItem.completed}
        className="mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Description */}
        <p
          className={cn(
            'text-sm text-gray-900',
            actionItem.completed && 'line-through text-gray-500'
          )}
        >
          {actionItem.description}
        </p>

        {/* Due Date Badge */}
        {actionItem.due_date && (
          <Badge
            variant={isOverdue ? 'destructive' : 'secondary'}
            className={cn(
              'mt-2 text-xs',
              actionItem.completed && 'bg-gray-200 text-gray-500'
            )}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {isOverdue && !actionItem.completed && 'Overdue: '}
            {formatDueDate(actionItem.due_date)}
          </Badge>
        )}
      </div>

      {/* Hover Actions */}
      {isHovered && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(actionItem)}
            aria-label="Edit action item"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(actionItem.id)}
            aria-label="Delete action item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
