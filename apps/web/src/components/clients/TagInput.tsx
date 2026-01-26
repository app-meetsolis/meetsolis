/**
 * TagInput Component
 * Story 2.5: Client Tags & Labels
 *
 * Tag input with autocomplete, validation, XSS prevention, and accessibility.
 * Uses Shadcn Command component for autocomplete dropdown.
 */

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Client } from '@meetsolis/shared';
import { TagPill } from './TagPill';
import { PREDEFINED_TAGS } from '@/lib/utils/tagColors';
import sanitizeHtml from 'sanitize-html';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { toast } from 'sonner';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  clients?: Client[];
  maxTags?: number;
  tier?: 'free' | 'pro';
}

/**
 * Sanitize tag to prevent XSS
 */
function sanitizeTag(tag: string): string {
  return sanitizeHtml(tag.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Validate tag format
 */
function isValidTag(tag: string): boolean {
  return (
    tag.length > 0 && tag.length <= 20 && /^[a-zA-Z0-9\s-]+$/.test(tag) // Only alphanumeric, spaces, hyphens
  );
}

export function TagInput({
  tags,
  onTagsChange,
  clients = [],
  maxTags = 3,
  tier = 'free',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedInput] = useDebounce(inputValue, 100);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract all unique tags from user's clients + predefined tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>(PREDEFINED_TAGS);
    clients.forEach(client => {
      client.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [clients]);

  // Filter suggestions based on debounced input
  const filteredTags = useMemo(() => {
    if (!debouncedInput.trim()) {
      return allTags.slice(0, 10);
    }
    const query = debouncedInput.toLowerCase();
    return allTags
      .filter(tag => tag.toLowerCase().includes(query))
      .filter(tag => !tags.includes(tag)) // Exclude already added tags
      .slice(0, 10);
  }, [allTags, debouncedInput, tags]);

  // Handle tag addition
  const addTag = (tagToAdd: string) => {
    const sanitized = sanitizeTag(tagToAdd);

    // Validate tag
    if (!sanitized) {
      return;
    }

    if (!isValidTag(sanitized)) {
      toast.error(
        'Invalid tag format. Use only letters, numbers, spaces, and hyphens (max 20 chars).'
      );
      return;
    }

    // Check for duplicates
    if (tags.includes(sanitized)) {
      toast.error('Tag already added');
      return;
    }

    // Check tier limit
    if (tags.length >= maxTags) {
      const tierName = tier === 'free' ? 'Free' : 'Pro';
      toast.error(
        `${tierName} tier limited to ${maxTags} tags. ${tier === 'free' ? 'Upgrade to Pro for 50 tags.' : ''}`
      );
      return;
    }

    onTagsChange([...tags, sanitized]);
    setInputValue('');
    setIsOpen(false);
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace on empty input
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Show/hide dropdown based on input focus and value
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleInputFocus = () => {
    if (inputValue.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  // Check if input should be disabled
  const isDisabled = tags.length >= maxTags;

  // Tag counter text
  const counterText =
    tier === 'free' ? `${tags.length}/${maxTags} tags` : `${tags.length} tags`;

  return (
    <div className="space-y-2">
      {/* Tag Counter */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="tag-input"
          className="text-sm font-medium text-gray-700"
        >
          Tags
        </label>
        <span className="text-xs text-gray-500">{counterText}</span>
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <TagPill
              key={tag}
              tag={tag}
              removable
              onRemove={() => removeTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Tag Input with Autocomplete */}
      <div className="relative">
        <Command className="border rounded-md">
          <CommandInput
            ref={inputRef}
            id="tag-input"
            placeholder={isDisabled ? 'Maximum tags reached' : 'Add tag...'}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={isDisabled}
            aria-label="Add tags"
            aria-autocomplete="list"
            aria-controls="tag-suggestions"
            aria-expanded={isOpen}
            className={isDisabled ? 'cursor-not-allowed opacity-50' : ''}
          />
          {isOpen && filteredTags.length > 0 && (
            <CommandList
              id="tag-suggestions"
              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredTags.map(tag => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={value => {
                    addTag(value);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {tag}
                </CommandItem>
              ))}
              <CommandEmpty>No tags found</CommandEmpty>
            </CommandList>
          )}
        </Command>
      </div>

      {/* Help text */}
      {isDisabled && tier === 'free' && (
        <p className="text-xs text-gray-500">
          Upgrade to Pro for 50 tags per client
        </p>
      )}
    </div>
  );
}
