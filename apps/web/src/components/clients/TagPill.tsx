/**
 * TagPill Component
 * Story 2.5: Client Tags & Labels
 *
 * Displays a tag as a colored pill with optional click/remove actions.
 * Includes XSS sanitization and full keyboard accessibility.
 */

'use client';

import { X } from 'lucide-react';
import { getTagColor } from '@/lib/utils/tagColors';
import sanitizeHtml from 'sanitize-html';

interface TagPillProps {
  tag: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function TagPill({
  tag,
  onClick,
  removable = false,
  onRemove,
}: TagPillProps) {
  // Sanitize tag to prevent XSS attacks
  const sanitizedTag = sanitizeHtml(tag, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Get consistent color for this tag
  const backgroundColor = getTagColor(sanitizedTag);

  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (removable && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      e.stopPropagation();
      onRemove?.();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (removable) {
      // Don't trigger onClick when clicking pill if removable
      // Only the X button should trigger remove
      return;
    }
    onClick?.();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const ariaLabel = removable
    ? `Remove ${sanitizedTag}`
    : onClick
      ? `Filter by ${sanitizedTag}`
      : sanitizedTag;

  return (
    <button
      type="button"
      className={`
        inline-flex items-center gap-1
        rounded-xl px-2 py-1
        text-[11px] font-medium
        transition-all duration-200
        ${onClick && !removable ? 'hover:opacity-80 cursor-pointer' : ''}
        ${removable ? 'pr-1' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
      style={{ backgroundColor }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <span className="text-gray-800">{sanitizedTag}</span>
      {removable && (
        <button
          type="button"
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          onClick={handleRemoveClick}
          aria-label={`Remove ${sanitizedTag}`}
          tabIndex={-1}
        >
          <X className="h-3 w-3 text-gray-700" aria-hidden="true" />
        </button>
      )}
    </button>
  );
}
