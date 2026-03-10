'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClientActionItem } from '@meetsolis/shared';

interface ActionItemCardProps {
  item: ClientActionItem;
  onComplete: (id: string) => void;
  onEdit: (item: ClientActionItem) => void;
  onDelete: (id: string) => void;
}

export function ActionItemCard({
  item,
  onComplete,
  onEdit,
  onDelete,
}: ActionItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = item.status === 'completed';

  return (
    <div
      className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => {
          if (!isCompleted) onComplete(item.id);
        }}
        disabled={isCompleted}
        className="mt-0.5 shrink-0"
        aria-label={isCompleted ? 'Completed' : 'Mark as complete'}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${isCompleted ? 'text-[#9CA3AF] line-through' : 'text-[#1A1A1A]'}`}
        >
          {item.description}
        </p>

        {item.assignee && (
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              item.assignee === 'coach'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {item.assignee === 'coach' ? 'Coach' : 'Client'}
          </span>
        )}
      </div>

      {isHovered && !isCompleted && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="rounded p-1 text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A1A]"
            aria-label="Edit action item"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="rounded p-1 text-[#6B7280] hover:bg-red-50 hover:text-red-600"
                aria-label="Delete action item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete action item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this action item. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
