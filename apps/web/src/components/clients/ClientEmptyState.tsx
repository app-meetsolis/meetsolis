/**
 * ClientEmptyState Component
 * Story 2.2: Client Dashboard UI - Task 4: Empty State
 *
 * Displays when user has no clients yet.
 * Shows message and "Add Client" button.
 */

import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export function ClientEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-gray-100 p-6">
        <Users className="h-12 w-12 text-gray-400" />
      </div>

      {/* Message */}
      <h3 className="mb-2 text-xl font-semibold text-[#1A1A1A]">
        No clients yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
        Add your first client to get started managing your professional
        relationships.
      </p>

      {/* Add Client Button */}
      <Button
        className="flex items-center gap-2"
        onClick={() => {
          // TODO: Open add client modal (Story 2.3)
          console.log('Add client clicked');
        }}
      >
        <Plus className="h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
}
