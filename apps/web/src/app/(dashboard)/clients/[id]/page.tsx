/**
 * Client Detail Page — Story 2.6 (full expansion)
 * Expands the Story 2.7 stub with: stats row, session timeline stub,
 * pending actions section, Ask Solis placeholder.
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Pencil, Sparkles } from 'lucide-react';
import { Client, ClientActionItem } from '@meetsolis/shared';

async function fetchPendingItems(
  clientId: string
): Promise<ClientActionItem[]> {
  const res = await fetch(
    `/api/action-items?client_id=${clientId}&status=pending`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.actionItems ?? [];
}
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from 'sonner';
import { NotesEditor } from '@/components/clients/NotesEditor';
import { ClientModal } from '@/components/clients/ClientModal';
import { SessionTimelineStub } from '@/components/clients/SessionTimelineStub';
import { PendingActionsSection } from '@/components/clients/PendingActionsSection';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchClient(id: string): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`);
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('FETCH_ERROR');
  return res.json();
}

function ClientDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-6 h-5 w-24" />
      <Skeleton className="mb-2 h-9 w-64" />
      <Skeleton className="mb-1 h-5 w-80" />
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-8 h-10 w-full rounded-lg" />
      <Skeleton className="mb-4 h-40 w-full rounded-lg" />
      <Skeleton className="mb-4 h-40 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isValidId = UUID_REGEX.test(id);

  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useQuery<Client, Error>({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id),
    enabled: isValidId,
    staleTime: 2 * 60 * 1000,
  });

  // Same query key as PendingActionsSection — deduplicates fetch, keeps count in sync
  const { data: pendingItems = [] } = useQuery<ClientActionItem[]>({
    queryKey: ['action-items', id],
    queryFn: () => fetchPendingItems(id),
    enabled: isValidId && !!client,
    staleTime: 60 * 1000,
  });
  const pendingCount = pendingItems.length;

  if (!isValidId) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">Invalid client ID.</p>
        <Button
          variant="ghost"
          onClick={() => router.push('/clients')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to clients
        </Button>
      </div>
    );
  }

  if (isLoading) return <ClientDetailSkeleton />;

  if (isError || !client) {
    const isNotFound = error?.message === 'NOT_FOUND';
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <p className="text-[#6B7280]">
          {isNotFound ? 'Client not found.' : 'Failed to load client.'}
        </p>
        <Button
          variant="ghost"
          onClick={() => router.push('/clients')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to clients
        </Button>
      </div>
    );
  }

  const coachingSince = client.start_date
    ? format(parseISO(client.start_date), 'MMM yyyy')
    : null;

  const lastSession = client.last_session_at
    ? format(new Date(client.last_session_at), 'MMM d, yyyy')
    : '—';

  return (
    <>
      <Toaster position="top-right" duration={3000} />

      <div className="min-h-screen bg-[#E8E4DD]">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          {/* Back link */}
          <button
            onClick={() => router.push('/clients')}
            className="mb-6 flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to clients
          </button>

          {/* Header */}
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {client.name}
              </h1>

              {client.goal && (
                <p className="mt-1 text-base text-[#6B7280]">{client.goal}</p>
              )}

              {coachingSince && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#9CA3AF]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Coaching since {coachingSince}</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                title={`Coming soon — Story 4.3`}
                className="gap-1.5 text-[#9CA3AF]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask Solis about {client.name}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-8 flex items-center gap-6 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm">
            <div className="text-center">
              <p className="font-semibold text-[#1A1A1A]">0</p>
              <p className="text-xs text-[#9CA3AF]">Total Sessions</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="font-semibold text-[#1A1A1A]">{pendingCount}</p>
              <p className="text-xs text-[#9CA3AF]">Pending Actions</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="font-semibold text-[#1A1A1A]">{lastSession}</p>
              <p className="text-xs text-[#9CA3AF]">Last Session</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <SessionTimelineStub />
            <PendingActionsSection clientId={client.id} />

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">
                Notes
              </h2>
              <NotesEditor
                clientId={client.id}
                initialNotes={client.notes ?? null}
              />
            </section>
          </div>
        </div>
      </div>

      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['client', id] });
        }}
        mode="edit"
        client={client}
      />
    </>
  );
}
