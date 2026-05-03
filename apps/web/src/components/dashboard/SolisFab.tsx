'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export function SolisFab() {
  const router = useRouter();
  return (
    <button
      title="Ask Solis"
      onClick={() => router.push('/intelligence')}
      className="fixed bottom-7 right-7 z-[200] w-[52px] h-[52px] rounded-full bg-primary border-none cursor-pointer flex items-center justify-center shadow-[0_4px_24px_rgba(34,197,94,0.4)] hover:scale-110 hover:shadow-[0_8px_32px_rgba(34,197,94,0.55)] transition-all duration-200"
    >
      <Sparkles className="h-[21px] w-[21px] text-black" />
    </button>
  );
}
