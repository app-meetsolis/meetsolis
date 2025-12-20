'use client';

import { Shield, Lock, Server } from 'lucide-react';

export function SecuritySection() {
  return (
    <section className="py-24 bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4 animate-pulse">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your Client&apos;s IP is Safe.
          </h2>
          <p className="text-xl text-white/60">
            We prioritize security and privacy above all else. Your data is
            yours alone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Lock className="w-8 h-8 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
            <p className="text-white/60">
              All video calls and file transfers are encrypted in transit and at
              rest.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Shield className="w-8 h-8 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold mb-2">GDPR Compliant</h3>
            <p className="text-white/60">
              Fully compliant with international data protection regulations.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Server className="w-8 h-8 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold mb-2">No Training on Data</h3>
            <p className="text-white/60">
              We never use your client conversations or files to train AI
              models.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
