'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionTimeline } from '@/components/sessions/SessionTimeline';
import { SessionUploadModal } from '@/components/sessions/SessionUploadModal';
import { SolisPanel } from '@/components/solis/SolisPanel';
import {
  ArrowLeft,
  Upload,
  Target,
  Calendar,
  Building2,
  Pencil,
} from 'lucide-react';
import { ClientModal } from '@/components/clients/ClientModal';
import { Client, Session } from '@meetsolis/shared';

async function fetchClient(id: string): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`);
  if (!res.ok) throw new Error('Client not found');
  return res.json();
}

async function fetchSessions(clientId: string): Promise<Session[]> {
  const res = await fetch(`/api/sessions?client_id=${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const data = await res.json();
  return data.sessions || [];
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: client,
    isLoading: clientLoading,
    isError: clientError,
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClient(clientId),
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', clientId],
    queryFn: () => fetchSessions(clientId),
    enabled: !!client,
  });

  if (clientLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">Client not found.</p>
        <Button
          variant="ghost"
          onClick={() => router.push('/clients')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
        </Button>
      </div>
    );
  }

  const coachingSince = client.start_date
    ? format(parseISO(client.start_date), 'MMMM yyyy')
    : null;

  const totalSessions = sessions.length;
  const pendingActionsCount = 0; // TODO: aggregate from action_items

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clients')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Clients
        </Button>

        {/* Client Header */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {client.name}
              </h1>

              {(client.role || client.company) && (
                <div className="mt-1 flex items-center gap-2 text-[#6B7280]">
                  <Building2 className="h-4 w-4" />
                  <span>
                    {[client.role, client.company].filter(Boolean).join(' at ')}
                  </span>
                </div>
              )}

              {client.goal && (
                <div className="mt-3 flex items-start gap-2">
                  <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#001F3F]" />
                  <p className="text-sm text-[#1A1A1A]">{client.goal}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#6B7280]">
                {coachingSince && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Coaching since {coachingSince}</span>
                  </div>
                )}
                <span>
                  {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
                </span>
                {pendingActionsCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-50 text-amber-700 text-[11px]"
                  >
                    {pendingActionsCount} pending actions
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                className="gap-2 bg-[#001F3F] hover:bg-[#003366]"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Transcript
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content: Sessions + Solis */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Session Timeline — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Session History
              </h2>
              <span className="text-sm text-[#6B7280]">
                {totalSessions} sessions
              </span>
            </div>

            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-white"
                  />
                ))}
              </div>
            ) : (
              <SessionTimeline sessions={sessions} clientId={clientId} />
            )}
          </div>

          {/* Solis Panel — 1/3 width */}
          <div className="h-[600px] lg:sticky lg:top-8">
            <SolisPanel clientId={clientId} clientName={client.name} />
          </div>
        </div>
      </div>

      <SessionUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        clientId={clientId}
      />

      <ClientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        mode="edit"
        client={client}
      />
    </div>
  );
}
