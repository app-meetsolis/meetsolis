'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  periodEnd: string | null;
  onClose: () => void;
  onCancelled: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'the end of your billing period';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CancelDialog({ open, periodEnd, onClose, onCancelled }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (!res.ok) throw new Error('cancel failed');
      toast.success(
        `Subscription cancelled. Access until ${formatDate(periodEnd)}.`
      );
      onCancelled();
      onClose();
    } catch {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel subscription?</DialogTitle>
          <DialogDescription>
            {"You'll keep Pro access until "}
            <strong>{formatDate(periodEnd)}</strong>
            {". After that, you'll downgrade to Free."}
          </DialogDescription>
        </DialogHeader>
        <ul className="text-[13px] text-muted-foreground space-y-1 list-disc pl-4">
          <li>Unlimited clients → 3 client limit</li>
          <li>25 transcripts/month → 5 lifetime transcripts</li>
          <li>2000 Solis queries → 75 lifetime queries</li>
        </ul>
        <DialogFooter className="gap-2">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Keep Pro
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
