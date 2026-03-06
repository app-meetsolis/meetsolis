'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface SolisSource {
  session_id: string;
  session_date: string;
  title?: string | null;
}

interface SolisMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SolisSource[];
}

interface SolisPanelProps {
  clientId?: string;
  clientName?: string;
}

const SUGGESTED_QUESTIONS = [
  'What breakthroughs has this client had recently?',
  'What are their recurring challenges?',
  'What action items are still pending?',
  'How has their progress been toward their goal?',
];

export function SolisPanel({ clientId, clientName }: SolisPanelProps) {
  const [messages, setMessages] = useState<SolisMessage[]>([]);
  const [input, setInput] = useState('');
  const [usageInfo, setUsageInfo] = useState<{
    current: number;
    limit: number;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, client_id: clientId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to query Solis');
      }
      return res.json();
    },
    onSuccess: (data, query) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
      if (data.usage) setUsageInfo(data.usage);
    },
    onError: (error: Error) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ]);
      toast.error(error.message);
    },
  });

  const handleSubmit = (query?: string) => {
    const q = (query || input).trim();
    if (!q) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    queryMutation.mutate(q);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#001F3F]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A1A]">Solis Intelligence</h3>
          {clientName && (
            <p className="text-xs text-[#6B7280]">About {clientName}</p>
          )}
        </div>
        {usageInfo && (
          <div className="ml-auto">
            <Badge variant="secondary" className="text-[10px]">
              {usageInfo.current}/
              {usageInfo.limit === Infinity ? '∞' : usageInfo.limit} queries
            </Badge>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280]">
              Ask anything about your client&apos;s coaching journey.
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="w-full rounded-md border border-gray-200 p-2.5 text-left text-sm text-[#1A1A1A] hover:bg-[#E8E4DD] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-[#001F3F] text-white'
                  : 'bg-[#E8E4DD] text-[#1A1A1A]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs opacity-60">Sources:</p>
                  {msg.sources.map(s => (
                    <p key={s.session_id} className="text-xs opacity-70">
                      {s.title || 'Session'} — {s.session_date}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {queryMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-[#E8E4DD] p-3">
              <p className="text-sm text-[#6B7280]">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask about ${clientName || 'your clients'}...`}
            rows={2}
            className="resize-none text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!input.trim() || queryMutation.isPending}
            className="self-end bg-[#001F3F] hover:bg-[#003366]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
