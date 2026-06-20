'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Session } from '@meetsolis/shared';
import { SpeakerReviewBanner } from '@/components/sessions/SpeakerReviewBanner';
import { SpeakerMappingEditor } from '@/components/sessions/SpeakerMappingEditor';
import { OpenCommitmentsSection } from '@/components/sessions/OpenCommitmentsSection';

interface SpeakerData {
  source: string;
  speaker_map: Record<string, string> | null;
  speaker_review_needed: boolean;
  review_note: string | null;
  client_name: string | null;
}

async function fetchSession(sessionId: string): Promise<Session> {
  const res = await fetch(`/api/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  return (await res.json()).session;
}

/** A bot session whose summary has not landed yet — poll for it. */
function isAwaitingSummary(session: Session): boolean {
  if (session.status === 'processing') return true;
  return (
    session.source === 'recall_ai' &&
    !session.summary &&
    session.status !== 'error'
  );
}

function SessionDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="skeleton rounded-md mb-6 h-5 w-32" />
      <div className="skeleton rounded-md mb-2 h-8 w-64" />
      <div className="skeleton rounded-md mb-6 h-4 w-32" />
      <div className="skeleton rounded-md h-96 w-full" />
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
    // Poll while a bot session's summary is still being generated.
    refetchInterval: q =>
      q.state.data && isAwaitingSummary(q.state.data) ? 4000 : false,
  });

  const { data: speakers } = useQuery<SpeakerData>({
    queryKey: ['speakers', sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/recall/sessions/${sessionId}/speakers`);
      if (!r.ok) throw new Error('FETCH_ERROR');
      return r.json();
    },
    enabled: session?.source === 'recall_ai',
  });

  // Toast once when a regenerating summary lands.
  const hadSummary = useRef<boolean | null>(null);
  useEffect(() => {
    if (!session) return;
    const has = !!session.summary;
    if (hadSummary.current === false && has) {
      toast.success('Summary updated.');
    }
    hadSummary.current = has;
  }, [session]);

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
  const isBotSession = session.source === 'recall_ai';
  const awaitingSummary = isAwaitingSummary(session);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" duration={3000} />
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

        {/* Open commitments carried forward from past sessions (Story 7.6) */}
        <OpenCommitmentsSection
          clientId={clientId}
          currentSessionId={sessionId}
        />

        {/* Speaker review (bot sessions only) */}
        {isBotSession && speakers?.speaker_review_needed && (
          <div className="mt-6">
            <SpeakerReviewBanner note={speakers.review_note} />
          </div>
        )}
        {isBotSession && (
          <div className="mt-4">
            <SpeakerMappingEditor sessionId={sessionId} />
          </div>
        )}

        {/* Summary */}
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
            Session Summary
          </p>
          {session.summary ? (
            <div className="prose prose-sm max-w-none rounded-lg bg-card shadow-card p-4 text-[13px] leading-relaxed text-foreground/75 [&_p]:mb-2 [&_strong]:text-foreground">
              <ReactMarkdown>{session.summary}</ReactMarkdown>
            </div>
          ) : awaitingSummary ? (
            <div className="flex items-center gap-2 rounded-lg bg-card shadow-card px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating summary…
            </div>
          ) : (
            <div className="rounded-lg bg-card shadow-card px-4 py-6 text-center text-sm text-muted-foreground">
              {session.status === 'error'
                ? 'Summary generation failed. Try regenerating from the client page.'
                : 'No summary available yet.'}
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
            Transcript
          </p>
          {session.transcript_text ? (
            <pre className="whitespace-pre-wrap overflow-y-auto max-h-[60vh] rounded-lg bg-card shadow-card p-4 text-sm text-foreground font-sans">
              {session.transcript_text}
            </pre>
          ) : (
            <div className="rounded-lg bg-card shadow-card px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No transcript text available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
