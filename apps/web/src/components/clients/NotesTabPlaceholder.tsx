/**
 * NotesTabPlaceholder Component
 * Story 2.6: Client Detail View (Enhanced) - Task 7
 *
 * Placeholder for Notes & Decisions tab
 * Will be replaced with rich text editor in Story 2.7
 */

'use client';

import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function NotesTabPlaceholder() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Notes & Decisions
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Notes editor will be implemented in Story 2.7
          </p>
        </div>
      </div>
    </Card>
  );
}
