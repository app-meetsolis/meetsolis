/**
 * Client Search Component
 * Story 2.4: Client Search & Filter - Task 1
 *
 * Search bar with:
 * - Debounced search (300ms)
 * - URL query param integration
 * - XSS prevention via sanitization
 * - Clear button
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import sanitizeHtml from 'sanitize-html';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const [query, setQuery] = useState(sanitizedInitialQuery);
  const [sort, setSort] = useState<SortOption>(sanitizedSort);

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

  // Update URL params when search or sort changes
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

    router.push(`/clients?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, sort, router, searchParams]);

  const handleClearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/clients?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#6B7280]">Sort by:</span>
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
  );
}
