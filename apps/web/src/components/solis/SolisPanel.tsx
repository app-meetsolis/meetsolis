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
          className="min-h-[72px] resize-none bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF]"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || mutation.isPending}
          className="h-[72px] shrink-0 bg-[#001F3F] px-3 hover:bg-[#003366]"
        >
          <Send className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Ask Solis</span>
        </Button>
      </div>

      {/* Suggested chips — hidden after first answer */}
      {!result && (
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              disabled={mutation.isPending}
              className="rounded-md border border-dashed border-[#9CA3AF] px-3 py-1.5 text-sm text-[#6B7280] transition-colors hover:border-[#001F3F] hover:text-[#001F3F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {mutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin text-[#001F3F]" />
          <span>Solis is thinking…</span>
        </div>
      )}

      {/* Answer */}
      {result && (
        <div className="rounded-lg border border-gray-200 border-l-2 border-l-[#001F3F]/20 bg-white p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#001F3F]" />
            <span className="text-sm font-medium text-[#1A1A1A]">Answer</span>
          </div>
          <div className="prose prose-sm max-w-none text-[#1A1A1A]">
            <ReactMarkdown>{result.answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Citations */}
      {result && result.citations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-[#6B7280]">Sources</p>
          <ul className="space-y-1">
            {result.citations.map(citation => {
              const label = `${format(parseISO(citation.session_date), 'MMM d, yyyy')} — ${citation.title}`;
              return (
                <li key={citation.session_id}>
                  {clientId ? (
                    <Link
                      href={`/clients/${clientId}/sessions/${citation.session_id}`}
                      className="text-sm text-[#001F3F] hover:underline"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-sm text-[#6B7280]">{label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Usage counter */}
      {usageData && (
        <p className="text-xs text-[#9CA3AF]">
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
