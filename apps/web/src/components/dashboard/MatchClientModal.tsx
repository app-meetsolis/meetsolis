'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Client, CalendarEventWithClient } from '@meetsolis/shared';

interface Props {
  event: CalendarEventWithClient;
  onClose: () => void;
  onMatched: () => void | Promise<void>;
}

async function fetchClients(): Promise<Client[]> {
  const r = await fetch('/api/clients');
  if (!r.ok) return [];
  return ((await r.json()).clients ?? []) as Client[];
}

async function saveMatch(
  eventId: string,
  body: { client_id: string; remember_email?: string }
): Promise<void> {
  const res = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to save match');
}

export function MatchClientModal({ event, onClose, onMatched }: Props) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [rememberEmail, setRememberEmail] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  // Find first attendee email that isn't the coach (heuristic: first non-empty)
  const candidateEmail = event.attendees?.[0]?.email ?? '';
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const showRememberCheckbox =
    Boolean(candidateEmail) &&
    Boolean(selectedClient) &&
    !selectedClient?.email;

  const save = useMutation({
    mutationFn: () =>
      saveMatch(event.id, {
        client_id: selectedClientId,
        ...(rememberEmail && candidateEmail
          ? { remember_email: candidateEmail }
          : {}),
      }),
    onSuccess: async () => {
      toast.success('Session matched to client');
      await onMatched();
    },
    onError: () => {
      toast.error('Failed to save match');
    },
  });

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Match this session to a client</DialogTitle>
          <DialogDescription className="text-[13px]">
            <span className="font-medium text-foreground">{event.title}</span>
            {candidateEmail && (
              <span className="block text-muted-foreground mt-1 text-[12px]">
                Attendee: {candidateEmail}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label className="text-[13px]">Client</Label>
          <Select
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            disabled={isLoading}
          >
            <SelectTrigger className="text-[13px]">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-[13px]">
                  {c.name}
                  {c.email && (
                    <span className="ml-2 text-muted-foreground text-[11px]">
                      {c.email}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showRememberCheckbox && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="remember-email"
                checked={rememberEmail}
                onCheckedChange={v => setRememberEmail(v === true)}
              />
              <Label
                htmlFor="remember-email"
                className="text-[12px] text-muted-foreground cursor-pointer"
              >
                Remember <span className="font-mono">{candidateEmail}</span> for{' '}
                {selectedClient?.name}
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!selectedClientId || save.isPending}
            size="sm"
          >
            {save.isPending ? 'Saving…' : 'Save match'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
