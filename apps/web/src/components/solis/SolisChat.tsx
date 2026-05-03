/**
 * SolisChat — full-page AI chat interface
 * WhatsApp-style bubbles · cycling thinking animation · toggleable history panel
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Clock, History, Sparkles, Send, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  UpgradeRequiredError,
  type UsageLimitType,
  type UsageResponse,
  type SolisQueryResponse,
} from '@meetsolis/shared';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

// -- Types ---------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  citations?: SolisQueryResponse['citations'];
  ts: Date;
}

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  ts: string;
}

export interface SolisChatProps {
  clientId?: string;
  clientName?: string;
}

// -- Constants -----------------------------------------------------------------

const THINKING_PHASES = [
  'Reading your sessions',
  'Analysing context',
  'Crafting your answer',
];

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
  ];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function groupHistory(items: HistoryItem[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const buckets: Record<string, HistoryItem[]> = {};
  for (const item of items) {
    const d = new Date(item.ts);
    const key =
      d.toDateString() === today.toDateString()
        ? 'Today'
        : d.toDateString() === yesterday.toDateString()
          ? 'Yesterday'
          : format(d, 'MMM d');
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(item);
  }
  return Object.entries(buckets).map(([label, its]) => ({ label, items: its }));
}

// -- Sub-components ------------------------------------------------------------

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[68%]">
        <div
          className="absolute -right-[7px] top-0 h-[12px] w-[8px] bg-[#000] dark:bg-[#273241]"
          style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}
        />
        <div className="rounded-[18px] rounded-tr-[3px] bg-[#000] dark:bg-[#273241] px-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white">
            {msg.text}
          </p>
        </div>
      </div>
    </div>
  );
}

function AIBubble({ msg, clientId }: { msg: ChatMessage; clientId?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#37ea9e]/15">
        <Sparkles className="h-3.5 w-3.5 text-[#1cd3a3]" />
      </div>
      <div className="max-w-[68%]">
        <div className="relative">
          <div
            className="absolute -left-[7px] top-0 h-[12px] w-[8px] bg-white dark:bg-[#161b22]"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
          />
          <div className="rounded-[18px] rounded-tl-[3px] bg-white dark:bg-[#161b22] px-4 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-[#000] dark:text-white/90 [&_p]:mb-2 [&_p:last-child]:mb-0">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-2.5 border-t border-[rgb(228,228,228)] dark:border-white/[0.07] pt-2">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4e5b6d] dark:text-white/35">
                  Sources
                </p>
                {msg.citations.map(c => (
                  <div key={c.session_id} className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0 text-[#4e5b6d] dark:text-white/30" />
                    {clientId ? (
                      <Link
                        href={`/clients/${clientId}/sessions/${c.session_id}`}
                        className="text-[11px] text-[#37ea9e] hover:underline"
                      >
                        {format(parseISO(c.session_date), 'MMM d, yyyy')} —{' '}
                        {c.title}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#4e5b6d] dark:text-white/40">
                        {format(parseISO(c.session_date), 'MMM d, yyyy')} —{' '}
                        {c.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble({ phase }: { phase: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#37ea9e]/15">
        <Sparkles className="h-3.5 w-3.5 text-[#1cd3a3] animate-pulse" />
      </div>
      <div className="relative">
        <div
          className="absolute -left-[7px] top-0 h-[12px] w-[8px] bg-white dark:bg-[#161b22]"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        />
        <div className="rounded-[18px] rounded-tl-[3px] bg-white dark:bg-[#161b22] px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <div className="mb-2 flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-[#37ea9e] animate-bounce"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
          <p className="text-[12px] text-[#4e5b6d] dark:text-white/45 transition-opacity duration-300">
            {phase}…
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  chips,
  onChip,
  disabled,
}: {
  chips: string[];
  onChip: (c: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#37ea9e]/10">
        <Sparkles className="h-7 w-7 text-[#37ea9e]" />
      </div>
      <h2 className="text-[17px] font-bold text-[#000] dark:text-white">
        Ask me anything
      </h2>
      <p className="mt-1.5 max-w-[300px] text-[13px] text-[#4e5b6d] dark:text-white/40">
        I know every session, action item, and breakthrough across all your
        clients.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => onChip(chip)}
            disabled={disabled}
            className="rounded-full border border-[rgb(209,213,221)] dark:border-white/[0.12] bg-white dark:bg-[#161b22] px-3.5 py-2 text-[12px] text-[#4e5b6d] dark:text-white/55 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all hover:border-[#37ea9e] hover:text-[#16a780] hover:shadow-[0_2px_8px_rgba(55,234,158,0.15)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e]"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

// -- Main Component ------------------------------------------------------------

export function SolisChat({ clientId, clientName }: SolisChatProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentQuery = useRef('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const [upgradeLimitType, setUpgradeLimitType] =
    useState<UsageLimitType | null>(null);

  const { data: usageData } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: () => fetch('/api/usage').then(r => r.json()),
    staleTime: 60_000,
  });

  // useMutation declared BEFORE effects that reference it
  const mutation = useMutation<SolisQueryResponse, Error, string>({
    mutationFn: async (q: string) => {
      const res = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          ...(clientId && { client_id: clientId }),
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        if (res.status === 403 && body.error?.code === 'LIMIT_EXCEEDED') {
          throw new UpgradeRequiredError(body.error.type as UsageLimitType);
        }
        throw new Error(body.error?.message || 'Query failed');
      }
      return res.json();
    },
    onSuccess: data => {
      setMessages(prev => [
        ...prev,
        {
          id: uid(),
          role: 'ai',
          text: data.answer,
          citations: data.citations,
          ts: new Date(),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      const item: HistoryItem = {
        id: uid(),
        question: currentQuery.current,
        answer: data.answer,
        ts: new Date().toISOString(),
      };
      setHistory(prev => {
        const updated = [item, ...prev].slice(0, 60);
        try {
          localStorage.setItem('solis-history', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    onError: err => {
      if (err instanceof UpgradeRequiredError) {
        setUpgradeLimitType(err.limitType);
        return;
      }
      toast.error("Solis couldn't answer that. Please try again.");
    },
  });

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('solis-history');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  // Cycle thinking phases while pending
  useEffect(() => {
    if (!mutation.isPending) {
      setThinkingPhase(0);
      return;
    }
    const t = setInterval(
      () => setThinkingPhase(p => (p + 1) % THINKING_PHASES.length),
      1400
    );
    return () => clearInterval(t);
  }, [mutation.isPending]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, mutation.isPending]);

  const sendQuery = (q: string) => {
    if (!q.trim() || mutation.isPending) return;
    currentQuery.current = q.trim();
    setMessages(prev => [
      ...prev,
      { id: uid(), role: 'user', text: q.trim(), ts: new Date() },
    ]);
    setInput('');
    mutation.mutate(q.trim());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setMessages([
      { id: uid(), role: 'user', text: item.question, ts: new Date(item.ts) },
      { id: uid(), role: 'ai', text: item.answer, ts: new Date(item.ts) },
    ]);
    setHistoryOpen(false);
  };

  const chips = clientName ? getClientChips(clientName) : GLOBAL_CHIPS;
  const groups = groupHistory(history);
  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* -- Header -- */}
      <div className="flex shrink-0 items-center justify-between border-b border-[rgb(228,228,228)] dark:border-white/[0.07] bg-[rgb(248,249,250)] dark:bg-[#0d1117] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#37ea9e]/15">
            <Sparkles className="h-4 w-4 text-[#1cd3a3]" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold leading-none text-[#000] dark:text-white">
              Solis Intelligence
            </h1>
            {usageData && (
              <p className="mt-0.5 text-[11px] text-[#4e5b6d] dark:text-white/35">
                {usageData.tier === 'free'
                  ? `${usageData.query_count} / 75 lifetime queries`
                  : `${usageData.query_count} / 2,000 queries this month`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasMessages && (
            <button
              onClick={() => setMessages([])}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] text-[#4e5b6d] dark:text-white/45 transition-colors hover:bg-white dark:hover:bg-white/[0.06] hover:text-[#000] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e]"
            >
              <Plus className="h-3.5 w-3.5" />
              New chat
            </button>
          )}
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e] ${
              historyOpen
                ? 'bg-[#37ea9e]/15 text-[#16a780]'
                : 'text-[#4e5b6d] dark:text-white/45 hover:bg-white dark:hover:bg-white/[0.06] hover:text-[#000] dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>

      {/* -- Body -- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
          >
            {!hasMessages && !mutation.isPending ? (
              <EmptyState
                chips={chips}
                onChip={sendQuery}
                disabled={mutation.isPending}
              />
            ) : (
              <div className="mx-auto w-full max-w-2xl space-y-4">
                {messages.map(msg =>
                  msg.role === 'user' ? (
                    <UserBubble key={msg.id} msg={msg} />
                  ) : (
                    <AIBubble key={msg.id} msg={msg} clientId={clientId} />
                  )
                )}
                {mutation.isPending && (
                  <ThinkingBubble phase={THINKING_PHASES[thinkingPhase]} />
                )}
              </div>
            )}
          </div>

          {/* Input box */}
          <div className="shrink-0 px-4 pb-4 pt-2">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-[16px] border border-[rgb(209,213,221)] dark:border-white/[0.12] bg-white dark:bg-[#161b22] px-4 pt-3 pb-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus-within:border-[#37ea9e] focus-within:shadow-[0_2px_12px_rgba(55,234,158,0.12)] transition-all duration-150">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    clientName
                      ? `Ask about ${clientName}…`
                      : 'Ask anything about your clients…'
                  }
                  disabled={mutation.isPending}
                  rows={1}
                  className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-[#000] dark:text-white placeholder:text-[#4e5b6d]/50 dark:placeholder:text-white/25 focus:outline-none disabled:opacity-50"
                  style={{ maxHeight: 120 }}
                  onInput={e => {
                    const t = e.currentTarget;
                    t.style.height = 'auto';
                    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                  }}
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] text-[#4e5b6d]/40 dark:text-white/20">
                    Enter to send · Shift+Enter for new line
                  </p>
                  <button
                    onClick={() => sendQuery(input)}
                    disabled={!input.trim() || mutation.isPending}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#37ea9e] text-black transition-all hover:bg-[#37ea9e]/85 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e] focus-visible:ring-offset-2"
                    aria-label="Send"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History panel — slides in from right */}
        <div
          className={`shrink-0 overflow-hidden border-l border-[rgb(228,228,228)] dark:border-white/[0.07] bg-white dark:bg-[#161b22] transition-[width] duration-200 ${
            historyOpen ? 'w-72' : 'w-0'
          }`}
        >
          <div className="flex h-full w-72 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-[rgb(228,228,228)] dark:border-white/[0.07] px-4 py-3">
              <span className="text-[12px] font-semibold text-[#000] dark:text-white">
                History
              </span>
              <button
                onClick={() => setHistoryOpen(false)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#4e5b6d] dark:text-white/40 hover:bg-[rgb(248,249,250)] dark:hover:bg-white/[0.06] hover:text-[#000] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {groups.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12px] text-[#4e5b6d] dark:text-white/35">
                  No history yet
                </p>
              ) : (
                groups.map(group => (
                  <div key={group.label} className="mb-3">
                    <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4e5b6d] dark:text-white/30">
                      {group.label}
                    </p>
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleHistorySelect(item)}
                        className="flex w-full cursor-pointer flex-col px-4 py-2.5 text-left transition-colors hover:bg-[rgb(248,249,250)] dark:hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#37ea9e]"
                      >
                        <p className="line-clamp-1 text-[12px] font-medium text-[#000] dark:text-white/80">
                          {item.question}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#4e5b6d] dark:text-white/30">
                          {formatDistanceToNow(new Date(item.ts), {
                            addSuffix: true,
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={!!upgradeLimitType}
        onClose={() => setUpgradeLimitType(null)}
        limitType={upgradeLimitType ?? 'query'}
      />
    </div>
  );
}
