/**
 * Client Search Empty State
 * Story 2.4: Client Search & Filter - Task 5
 *
 * Displayed when search returns no results
 * - Sanitized query display (XSS prevention)
 * - Clear search action
 */

'use client';

import sanitizeHtml from 'sanitize-html';
import { Button } from '@/components/ui/button';

interface ClientSearchEmptyProps {
  query: string;
  onClearSearch: () => void;
}

export function ClientSearchEmpty({
  query,
  onClearSearch,
}: ClientSearchEmptyProps) {
  // Sanitize query for safe display (XSS prevention)
  const sanitizedQuery = sanitizeHtml(query, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-white p-12 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="mb-2 text-lg font-semibold text-[#1A1A1A]">
          No clients found
        </h3>
        <p className="mb-6 text-sm text-[#6B7280]">
          No clients found matching &apos;{sanitizedQuery}&apos;
        </p>
        <Button onClick={onClearSearch} variant="outline">
          Clear search
        </Button>
      </div>
    </div>
  );
}
