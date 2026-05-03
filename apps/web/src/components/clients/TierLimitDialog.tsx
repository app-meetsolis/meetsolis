/**
 * TierLimitDialog Component
 * Story 2.3: Add/Edit Client Modal - Task 6
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

interface TierLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  maxClients: number;
}

export function TierLimitDialog({
  isOpen,
  onClose,
  currentCount,
  maxClients,
}: TierLimitDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-400/15 p-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-foreground">
              Client Limit Reached
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-[13px] text-muted-foreground">
            You&apos;ve reached your client limit ({currentCount}/{maxClients}).
            Upgrade to Pro for unlimited clients.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
