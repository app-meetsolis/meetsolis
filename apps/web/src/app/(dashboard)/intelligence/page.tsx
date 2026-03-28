'use client';

import { SolisPanel } from '@/components/solis/SolisPanel';

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#E8E4DD]">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          Solis Intelligence
        </h1>
        <p className="mt-2 text-[#6B7280]">
          Ask anything about your clients and their coaching journeys.
        </p>
        <div className="mt-8">
          <SolisPanel />
        </div>
      </div>
    </div>
  );
}
