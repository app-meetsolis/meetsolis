'use client';

import { LottiePlaceholder } from './LottiePlaceholder';

export function ClientCardDeepDive() {
  return (
    <section className="py-24 md:py-32 bg-[#F0F1FF] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase">
              Your Digital Brain per Client
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Never search for that file again.
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Create a dedicated Card for every client. Store their brand
              assets, previous meeting notes, and active slide decks right
              inside the contact. When it&apos;s time to meet, everything is
              there, instantly.
            </p>

            <ul className="space-y-4">
              {[
                'Context-rich meetings',
                'Instant file access',
                'Seamless organization',
              ].map(item => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-lg text-foreground/80"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Visual Element with depth */}
            <div className="relative z-10 rounded-[32px] p-2 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md shadow-2xl border border-white/60 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-white shadow-sm">
                <LottiePlaceholder
                  label="Client Card Interaction"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Soft shadows/glows behind */}
            <div className="absolute top-10 left-10 -right-10 -bottom-10 bg-primary/20 blur-[60px] -z-10" />

            {/* Floating Elements (simulating 3D bubbles or glassy elements) */}
            <div
              className="absolute -top-8 -right-8 w-20 h-20 bg-secondary/30 rounded-full blur-xl animate-bounce"
              style={{ animationDuration: '3s' }}
            />
            <div className="absolute -bottom-12 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
