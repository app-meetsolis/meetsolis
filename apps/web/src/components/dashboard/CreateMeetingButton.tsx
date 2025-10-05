/**
 * CreateMeetingButton Component
 * Quick meeting creation with modal dialog
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMeeting } from '@/hooks/useMeetings';

interface MeetingFormData {
  title: string;
  description?: string;
}

export function CreateMeetingButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: createMeeting, isPending } = useCreateMeeting();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      title: 'Quick Meeting',
      description: '',
    },
  });

  // Keyboard shortcut: Ctrl+N to open new meeting dialog
  useHotkeys('ctrl+n', () => {
    setOpen(true);
  });

  const onSubmit = (data: MeetingFormData) => {
    createMeeting(
      {
        title: data.title,
        description: data.description || null,
      },
      {
        onSuccess: meeting => {
          setOpen(false);
          reset();
          // Extract meeting ID from invite_link
          const meetingId = meeting.invite_link.split('/').pop();
          router.push(`/meeting/${meetingId}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-[#001F3F] text-white hover:bg-[#001F3F]/90"
        >
          <Plus className="mr-2 h-5 w-5" />
          Start Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Start an instant meeting or schedule one for later. Press Ctrl+N
            anytime to create a meeting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 200,
                  message: 'Title must be less than 200 characters',
                },
              })}
              placeholder="e.g., Client Review Call"
              aria-invalid={errors.title ? 'true' : 'false'}
            />
            {errors.title && (
              <p className="text-sm text-red-600" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Add meeting details or agenda..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#001F3F] hover:bg-[#001F3F]/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Meeting'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
