'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { WaitlistModal } from '@/components/waitlist/WaitlistModal';

export function FinalCTASection() {
  return (
    <section className="py-32 bg-[#0B0F19] text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-heading">
            Ready to automate your memory?
          </h2>
          <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join 100+ freelancers focusing on work, not logistics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <WaitlistModal>
              <Button
                size="lg"
                className="rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-all font-semibold h-14 px-8 text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Join the waitlist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </WaitlistModal>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Free during beta
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> No credit card
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
