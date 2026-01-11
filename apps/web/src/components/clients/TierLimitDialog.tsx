/**
 * TierLimitDialog Component
 * Story 2.3: Add/Edit Client Modal - Task 6
 *
 * Warning dialog when client limit is reached:
 * - Shows current limit (e.g., 3/3 for free tier)
 * - Upgrade button linking to /pricing
 * - Cancel button
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
              Client Limit Reached
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base text-[#6B7280]">
            You&apos;ve reached your client limit ({currentCount}/{maxClients}).
            Upgrade to Pro for 50 clients.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-[#001F3F] hover:bg-[#003366]"
          >
            Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
