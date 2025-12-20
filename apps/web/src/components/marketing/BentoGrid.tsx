'use client';

import { LottiePlaceholder } from './LottiePlaceholder';

export function BentoGrid() {
  return (
    <section className="py-24 md:py-32 bg-[#F9F9FB]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            A Workflow Built for Freelancers
          </h2>
          <p className="text-xl text-muted-foreground">
            Every feature is designed to cut down admin time and make you look
            professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Card A: Quick-Start Dashboard (Spans 2 cols) */}
          <div className="md:col-span-2 rounded-[32px] bg-white p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-8 max-w-lg">
                <h3 className="text-2xl font-bold mb-2">
                  No links. No waiting rooms.
                </h3>
                <p className="text-muted-foreground text-lg">
                  Just click the client&apos;s face to ring them instantly.
                </p>
              </div>
              <div className="flex-1 min-h-[200px] w-full bg-accent/30 rounded-2xl overflow-hidden mt-4">
                <LottiePlaceholder
                  label="One-Click Start"
                  className="w-full h-full bg-transparent"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-0" />
          </div>

          {/* Card D: Client History (Tall Vertical) */}
          <div className="md:row-span-2 rounded-[32px] bg-white p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  The Relationship Timeline
                </h3>
                <p className="text-muted-foreground text-lg">
                  See your entire history with a client before you hop on the
                  call.
                </p>
              </div>
              <div className="flex-1 w-full bg-[#f8f9fc] rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 p-4">
                  {/* Mock Timeline */}
                  <div className="space-y-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-300" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <LottiePlaceholder
                    label="Scroll History"
                    className="w-full h-full absolute inset-0 bg-transparent/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Contextual Notes */}
          <div className="rounded-[32px] bg-[#E6F4F1] p-8 md:p-10 shadow-sm border border-transparent hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold mb-2">Auto-Save Notes</h3>
              <p className="text-muted-foreground/80 mb-6">
                Notes link to specific timestamps.
              </p>
              <div className="flex-1 w-full bg-white/60 rounded-2xl overflow-hidden">
                <LottiePlaceholder
                  label="Split Screen Notes"
                  className="bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Card C: Presentation Mode */}
          <div className="rounded-[32px] bg-[#FFF0E6] p-8 md:p-10 shadow-sm border border-transparent hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold mb-2">
                Drag & Drop Presenting
              </h3>
              <p className="text-muted-foreground/80 mb-6">
                Stop asking &quot;Can you see my screen?&quot;
              </p>
              <div className="flex-1 w-full bg-white/60 rounded-2xl overflow-hidden">
                <LottiePlaceholder
                  label="Drag PDF to Present"
                  className="bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
