'use client';

export function SocialProof() {
  const platforms = ['Upwork', 'Toptal', 'Dribbble', 'Contra', 'Fiverr Pro'];

  return (
    <section className="py-20 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">
          Loved by pros on platforms like
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {platforms.map(platform => (
            <div
              key={platform}
              className="text-xl md:text-2xl font-bold text-foreground/80 font-sans tracking-tight"
            >
              {platform}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
