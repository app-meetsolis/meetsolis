/**
 * Client Search Component
 * Story 2.4: Client Search & Filter - Task 1
 * Story 2.5: Client Tags & Labels - Task 6
 *
 * Search bar with:
 * - Debounced search (300ms)
 * - URL query param integration
 * - XSS prevention via sanitization
 * - Clear button
 * - Tag filtering with multi-select
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import sanitizeHtml from 'sanitize-html';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TagPill } from './TagPill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export type SortOption = 'name-asc' | 'last-meeting' | 'date-added';

interface ClientSearchProps {
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  availableTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

export function ClientSearch({
  onSearchChange,
  onSortChange,
  availableTags = [],
  onTagsChange,
}: ClientSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Read and sanitize URL params
  const rawQuery = searchParams.get('q') || '';
  const sanitizedInitialQuery = sanitizeHtml(rawQuery, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const rawSort = searchParams.get('sort') || 'date-added';
  const sanitizedSort = sanitizeHtml(rawSort, {
    allowedTags: [],
    allowedAttributes: {},
  }) as SortOption;

  // Read and sanitize tags from URL
  const rawTags = searchParams.get('tags') || '';
  const sanitizedInitialTags = rawTags
    ? rawTags
        .split(',')
        .map(tag =>
          sanitizeHtml(tag, {
            allowedTags: [],
            allowedAttributes: {},
          })
        )
        .filter(tag => tag.length > 0)
    : [];

  const [query, setQuery] = useState(sanitizedInitialQuery);
  const [sort, setSort] = useState<SortOption>(sanitizedSort);
  const [selectedTags, setSelectedTags] =
    useState<string[]>(sanitizedInitialTags);

  // Debounce search query (300ms)
  const [debouncedQuery] = useDebounce(query, 300);

  // Notify parent of debounced query changes
  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  // Notify parent of sort changes
  useEffect(() => {
    onSortChange(sort);
  }, [sort, onSortChange]);

  // Notify parent of tags changes
  useEffect(() => {
    onTagsChange?.(selectedTags);
  }, [selectedTags, onTagsChange]);

  // Update URL params when search, sort, or tags change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }

    if (sort !== 'date-added') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }

    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }

    router.push(`/clients?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, sort, selectedTags, router, searchParams]);

  const handleClearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/clients?${params.toString()}`, { scroll: false });
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search clients by name or company"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2">
          {/* Tag Filter Button - Story 2.5 */}
          {availableTags.length > 0 && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {selectedTags.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Filter by tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllTags}
                        className="h-auto p-0 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleToggleTag(tag)}
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280]">Sort:</span>
            <Select
              value={sort}
              onValueChange={value => setSort(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-added">Date Added (Newest)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="last-meeting">Last Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Selected Tags - Story 2.5 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#6B7280]">Filtering by:</span>
          {selectedTags.map(tag => (
            <TagPill
              key={tag}
              tag={tag}
              removable
              onRemove={() => handleRemoveTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
