/**
 * ClientEmptyState Component
 * Story 2.2: Client Dashboard UI - Task 4: Empty State
 *
 * Displays when user has no clients yet.
 * Shows message and "Add Client" button.
 */

import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface ClientEmptyStateProps {
  onAddClient?: () => void;
}

export function ClientEmptyState({ onAddClient }: ClientEmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-border bg-card p-12 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-6">
        <Users className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Message */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        No clients yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Add your first client to get started managing your professional
        relationships.
      </p>

      {/* Add Client Button */}
      <Button className="flex items-center gap-2" onClick={onAddClient}>
        <Plus className="h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
}
