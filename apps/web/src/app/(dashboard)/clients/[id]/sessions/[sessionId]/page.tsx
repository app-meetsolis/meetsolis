'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Session } from '@meetsolis/shared';

async function fetchSession(sessionId: string): Promise<Session> {
  const res = await fetch(`/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  const data = await res.json();
  return data.session;
}

function SessionDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="skeleton rounded-md mb-6 h-5 w-32" />
      <div className="skeleton rounded-md mb-2 h-8 w-64" />
      <div className="skeleton rounded-md mb-6 h-4 w-32" />
      <div className="skeleton rounded-md h-96 w-full rounded-lg" />
    </div>
  );
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const sessionId = params.sessionId as string;

  const {
    data: session,
    isLoading,
    isError,
  } = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId),
  });

  if (isLoading) return <SessionDetailSkeleton />;

  if (isError || !session) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}`)}
          className="mb-6 gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to client
        </Button>
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    );
  }

  const formattedDate = format(parseISO(session.session_date), 'MMM d, yyyy');
  const transcriptContent = session.transcript_text ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clients/${clientId}`)}
          className="mb-6 gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to client
        </Button>

        <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{formattedDate}</p>

        {transcriptContent ? (
          <pre className="mt-6 whitespace-pre-wrap overflow-y-auto max-h-[70vh] rounded-lg border border-border bg-card p-4 text-sm text-foreground font-sans">
            {transcriptContent}
          </pre>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-card px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No transcript text available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
