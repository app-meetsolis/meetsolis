/**
 * ClientSearch Component
 * v3: Name search + sort only — tag filter removed
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

export type SortOption = 'name-asc' | 'last-session' | 'date-added';

interface ClientSearchProps {
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
}

export function ClientSearch({
  onSearchChange,
  onSortChange,
}: ClientSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  useEffect(() => {
    onSortChange(sort);
  }, [sort, onSortChange]);

  // Sync URL params
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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort:</span>
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
            <SelectItem value="last-session">Last Session</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
