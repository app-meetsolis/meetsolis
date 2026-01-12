/**
 * MeetingHistoryTabEmpty Component
 * Story 2.6: Client Detail View (Enhanced) - Task 6
 *
 * Empty state for Meeting History tab
 * Displayed when client has no meetings yet
 */

'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MeetingHistoryTabEmpty() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            No meetings yet
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Log your first meeting to see it here.
          </p>
        </div>

        {/* Action Button (disabled - Epic 3 feature) */}
        <Button disabled className="mt-4">
          + Log Meeting
        </Button>
      </div>
    </Card>
  );
}
