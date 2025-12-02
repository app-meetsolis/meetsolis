/**
 * Leave Meeting Confirmation Dialog
 *
 * Shows a confirmation dialog before leaving a meeting.
 * Displays different messages for organizers vs regular participants.
 *
 * - Organizers see a warning that leaving will end the meeting for ALL participants
 * - Regular participants see a simple confirmation
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface LeaveMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isOrganizer: boolean;
  participantCount: number;
  isLoading?: boolean;
}

export function LeaveMeetingDialog({
  open,
  onOpenChange,
  onConfirm,
  isOrganizer,
  participantCount,
  isLoading = false,
}: LeaveMeetingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Meeting?</DialogTitle>
          <DialogDescription>
            {isOrganizer ? (
              <>
                <span className="text-yellow-600 font-semibold">
                  This will end the meeting for all {participantCount}{' '}
                  {participantCount === 1 ? 'participant' : 'participants'}.
                </span>{' '}
                Are you sure you want to leave and end the meeting?
              </>
            ) : (
              'Are you sure you want to leave this meeting?'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Stay in Meeting
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Leaving...</span>
              </div>
            ) : (
              'Leave Meeting'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
