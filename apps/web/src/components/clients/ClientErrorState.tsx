/**
 * ClientErrorState Component
 * Story 2.2: Client Dashboard UI - Task 6: Error State
 *
 * Displays when client data fails to load.
 * Shows error message and retry button.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ClientErrorStateProps {
  error?: string;
  onRetry: () => void;
}

export function ClientErrorState({
  error = 'Failed to load clients',
  onRetry,
}: ClientErrorStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2 mb-4">
          {error}. Please try again.
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Alert>
    </div>
  );
}
