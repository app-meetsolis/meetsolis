'use client';

import { useQuery } from '@tanstack/react-query';
import { SolisPanel } from '@/components/solis/SolisPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client } from '@meetsolis/shared';
import { useState, useMemo } from 'react';

async function fetchClients(): Promise<Client[]> {
  const res = await fetch('/api/clients');
  if (!res.ok) return [];
  const data = await res.json();
  return data.clients || [];
}

export default function IntelligencePage() {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined
  );

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Solis Intelligence
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Ask questions about your clients&apos; coaching journeys
          </p>
        </div>

        {/* Client selector */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-[#6B7280]">Client:</span>
          <Select
            value={selectedClientId || 'all'}
            onValueChange={v =>
              setSelectedClientId(v === 'all' ? undefined : v)
            }
          >
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[600px]">
          <SolisPanel
            clientId={selectedClientId}
            clientName={selectedClient?.name}
          />
        </div>
      </div>
    </div>
  );
}
