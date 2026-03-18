'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientActionItem, ActionItemStatus } from '@meetsolis/shared';

interface ActionItemRowProps {
  item: ClientActionItem;
  onCheckboxChange: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: ActionItemStatus) => void;
}

const STATUS_LABELS: Record<ActionItemStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ActionItemRow({
  item,
  onCheckboxChange,
  onStatusChange,
}: ActionItemRowProps) {
  const isCompleted = item.status === 'completed';

  return (
    <div className="flex items-center gap-2 py-1.5">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={checked => onCheckboxChange(item.id, !!checked)}
        className="shrink-0"
      />
      <span
        className={`flex-1 text-sm text-[#1A1A1A] ${isCompleted ? 'line-through opacity-50' : ''}`}
      >
        {item.description}
      </span>
      {item.assignee && (
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${
            item.assignee === 'coach'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {item.assignee === 'coach' ? 'Coach' : 'Client'}
        </span>
      )}
      <Select
        value={item.status}
        onValueChange={val => onStatusChange(item.id, val as ActionItemStatus)}
      >
        <SelectTrigger className="h-7 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as ActionItemStatus[]).map(s => (
            <SelectItem key={s} value={s} className="text-xs">
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
