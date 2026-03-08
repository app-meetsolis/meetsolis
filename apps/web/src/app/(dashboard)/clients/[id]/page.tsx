/**
 * Client Detail Page — Story 2.7 (minimal stub)
 * Hosts the NotesEditor; Story 2.6 will expand with session timeline etc.
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Client } from '@meetsolis/shared';
import { ArrowLeft, Pencil, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NotesEditor } from '@/components/clients/NotesEditor';
import { ClientModal } from '@/components/clients/ClientModal';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

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
      <Skeleton className="mb-8 h-4 w-40" />
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

          {/* Client header */}
          <div className="mb-8 flex items-start justify-between gap-4">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="shrink-0"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          {/* Notes section */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">Notes</h2>
            <NotesEditor
              clientId={client.id}
              initialNotes={client.notes ?? null}
            />
          </section>
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
