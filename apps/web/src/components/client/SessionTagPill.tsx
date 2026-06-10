/**
 * Story 7.7 — Session tag pill with dropdown to change/remove.
 *
 * Closed enum: breakthrough, stuck, milestone, goal-setting.
 * `breakthrough` is styled with warm yellow accent (intentional brand exception).
 * Others use neutral teal chip.
 */

'use client';

import { Plus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SESSION_TAGS, type SessionTag } from '@meetsolis/shared';

const TAG_LABELS: Record<SessionTag, string> = {
  breakthrough: 'Breakthrough ✦',
  stuck: 'Stuck',
  milestone: 'Milestone',
  'goal-setting': 'Goal-setting',
};

function tagClassName(tag: SessionTag, isAddSlot = false): string {
  if (isAddSlot) {
    return 'inline-flex items-center gap-1 rounded-full border border-dashed border-foreground/20 px-2 py-0.5 text-[10px] font-medium text-foreground/40 hover:text-foreground/70 hover:border-foreground/40 transition-colors';
  }
  if (tag === 'breakthrough') {
    return 'inline-flex items-center gap-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 px-2 py-0.5 text-[10px] font-semibold text-yellow-300';
  }
  return 'inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary';
}

interface PillProps {
  tag: SessionTag;
  onRemove: () => void;
  onChange: (next: SessionTag) => void;
}

export function SessionTagPill({ tag, onRemove, onChange }: PillProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={tagClassName(tag)}>
          {TAG_LABELS[tag]}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {SESSION_TAGS.filter(t => t !== tag).map(t => (
          <DropdownMenuItem key={t} onClick={() => onChange(t)}>
            {TAG_LABELS[t]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onRemove}
          className="text-red-400 focus:text-red-300"
        >
          <X className="h-3 w-3 mr-1.5" /> Remove tag
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AddTagButtonProps {
  existing: SessionTag[];
  onAdd: (tag: SessionTag) => void;
}

export function AddTagButton({ existing, onAdd }: AddTagButtonProps) {
  const available = SESSION_TAGS.filter(t => !existing.includes(t));
  if (available.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={tagClassName('stuck', true)}>
          <Plus className="h-3 w-3" />
          Add tag
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {available.map(t => (
          <DropdownMenuItem key={t} onClick={() => onAdd(t)}>
            {TAG_LABELS[t]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
