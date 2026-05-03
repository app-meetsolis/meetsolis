'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  UpgradeRequiredError,
  type UsageLimitType,
  type UsageResponse,
  type SolisQueryResponse,
} from '@meetsolis/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

interface SolisPanelProps {
  clientId?: string;
  clientName?: string;
}

const GLOBAL_CHIPS = [
  'What client has the most open action items?',
  "Which clients haven't had a session in 30+ days?",
  'What themes appear across all clients?',
];

function getClientChips(name: string) {
  return [
    `What are ${name}'s biggest challenges?`,
    `What commitments did ${name} make?`,
    `What progress has ${name} made?`,
    `What themes keep coming up for ${name}?`,
  ];
}

export function SolisPanel({ clientId, clientName }: SolisPanelProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SolisQueryResponse | null>(null);
  const [upgradeLimitType, setUpgradeLimitType] =
    useState<UsageLimitType | null>(null);

  const { data: usageData } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: () => fetch('/api/usage').then(r => r.json()),
    staleTime: 60_000,
  });

  const mutation = useMutation<SolisQueryResponse, Error, string>({
    mutationFn: async (q: string) => {
      const response = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          ...(clientId && { client_id: clientId }),
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        if (response.status === 403 && body.error?.code === 'LIMIT_EXCEEDED') {
          throw new UpgradeRequiredError(body.error.type as UsageLimitType);
        }
        throw new Error(body.error?.message || 'Query failed');
      }
      return response.json();
    },
    onSuccess: data => {
      setQuery('');
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
    onError: error => {
      if (error instanceof UpgradeRequiredError) {
        setUpgradeLimitType(error.limitType);
        return;
      }
      toast.error("Solis couldn't answer that. Please try again.");
    },
  });

  const chips = clientName ? getClientChips(clientName) : GLOBAL_CHIPS;

  const handleSubmit = () => {
    if (!query.trim() || mutation.isPending) return;
    mutation.mutate(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    mutation.mutate(chip);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input area */}
      <div className="flex items-end gap-2">
        <Textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            clientName
              ? `Ask about ${clientName}...`
              : 'Ask anything about your clients...'
          }
          disabled={mutation.isPending}
          className="min-h-[72px] resize-none bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 focus-visible:border-primary/40"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || mutation.isPending}
          className="h-[72px] shrink-0 bg-primary text-primary-foreground font-semibold hover:bg-primary/85 px-4 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Ask</span>
        </Button>
      </div>

      {/* Suggested chips */}
      {!result && (
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <Button
              key={chip}
              variant="outline"
              size="sm"
              onClick={() => handleChipClick(chip)}
              disabled={mutation.isPending}
              className="rounded-full border-border text-muted-foreground hover:border-accent hover:text-secondary-foreground disabled:opacity-40"
            >
              {chip}
            </Button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {mutation.isPending && (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Solis is thinking…</span>
        </div>
      )}

      {/* Answer */}
      {result && (
        <div
          className="rounded-[12px] border border-border bg-muted p-4"
          style={{ borderLeftWidth: 2, borderLeftColor: 'var(--primary)' }}
        >
          <div className="mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[13px] font-semibold text-foreground">
              Answer
            </span>
          </div>
          <div className="prose prose-sm max-w-none prose-invert text-secondary-foreground prose-p:text-secondary-foreground prose-strong:text-foreground prose-li:text-secondary-foreground">
            <ReactMarkdown>{result.answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Citations */}
      {result && result.citations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Sources
          </p>
          <ul className="space-y-1">
            {result.citations.map(citation => {
              const label = `${format(parseISO(citation.session_date), 'MMM d, yyyy')} — ${citation.title}`;
              return (
                <li key={citation.session_id}>
                  {clientId ? (
                    <Link
                      href={`/clients/${clientId}/sessions/${citation.session_id}`}
                      className="text-[12px] text-primary hover:opacity-70 transition-opacity"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-[12px] text-muted-foreground">
                      {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Usage counter */}
      {usageData && (
        <p className="text-[11px] text-muted-foreground">
          {usageData.tier === 'free'
            ? `${usageData.query_count} of 75 lifetime queries used`
            : `${usageData.query_count} of 2,000 monthly queries used`}
        </p>
      )}

      <UpgradeModal
        isOpen={!!upgradeLimitType}
        onClose={() => setUpgradeLimitType(null)}
        limitType={upgradeLimitType ?? 'query'}
      />
    </div>
  );
}
