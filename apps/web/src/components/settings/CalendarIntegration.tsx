'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import type { CalendarConnectionStatus } from '@meetsolis/shared';

async function fetchStatus(): Promise<CalendarConnectionStatus> {
  const res = await fetch('/api/calendar/status');
  if (!res.ok) throw new Error('Failed to load calendar status');
  return res.json();
}

async function disconnect(): Promise<void> {
  const res = await fetch('/api/calendar/disconnect', { method: 'POST' });
  if (!res.ok) throw new Error('Disconnect failed');
}

export function CalendarIntegration() {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: fetchStatus,
  });

  // Surface result of OAuth callback redirect
  useEffect(() => {
    const status = params?.get('calendar');
    if (!status) return;
    if (status === 'connected') {
      toast.success('Google Calendar connected');
      queryClient.invalidateQueries({ queryKey: ['calendar-status'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } else if (status === 'denied') {
      toast.error(
        'Calendar access denied. Try again to enable upcoming sessions.'
      );
    } else if (status === 'error') {
      toast.error('Calendar connection failed. Please try again.');
    }
  }, [params, queryClient]);

  async function handleDisconnect() {
    try {
      await disconnect();
      await queryClient.invalidateQueries({ queryKey: ['calendar-status'] });
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Google Calendar disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
  }

  if (isLoading) {
    return (
      <SectionCard icon={Calendar} title="Integrations">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
      </SectionCard>
    );
  }

  const isConnected = Boolean(data?.connected);
  const isBroken = Boolean(data?.connection_broken);

  return (
    <SectionCard icon={Calendar} title="Integrations">
      <div className="space-y-1">
        <p className="text-[13px] font-medium text-foreground">
          Google Calendar
        </p>
        <p className="text-[12px] text-muted-foreground">
          Auto-detect upcoming coaching sessions and show them on your
          dashboard.
        </p>
      </div>

      {isConnected && !isBroken && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-[13px] text-foreground truncate">
              Connected: <span className="font-medium">{data?.email}</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDisconnect()}
            className="shrink-0 text-[12px] h-8"
          >
            Disconnect
          </Button>
        </div>
      )}

      {isConnected && isBroken && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-[13px] text-muted-foreground truncate">
              Connection expired — reconnect to resume syncing.
            </span>
          </div>
          <Button asChild size="sm" className="shrink-0 text-[12px] h-8">
            <a href="/api/calendar/connect">Reconnect</a>
          </Button>
        </div>
      )}

      {!isConnected && (
        <div className="pt-1">
          <Button asChild size="sm" className="text-[12px] h-8">
            <a href="/api/calendar/connect">Connect Google Calendar</a>
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
