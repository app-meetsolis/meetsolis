'use client';

export function EarlyUsersSection() {
    return (
        <section className="py-16 bg-transparent">
            <div className="container px-4 md:px-6 text-center">
                <p className="text-lg font-medium text-muted-foreground mb-10">
                    Freelancers, consultants, and small agencies are already helping shape MeetSolis.
                </p>

                {/* Subtle Container - Premium Glass */}
                <div className="max-w-5xl mx-auto px-12 py-10 rounded-[32px] bg-white/40 backdrop-blur-md border border-white/40 shadow-sm flex flex-wrap justify-center items-center gap-12 md:gap-20 ring-1 ring-black/5 hover:bg-white/60 transition-colors duration-500">
                    {/* Text Logos with Premium Feel */}
                    <span className="text-xl md:text-2xl font-bold font-serif opacity-30 tracking-tight hover:opacity-60 transition-opacity cursor-default">Acme Studio</span>
                    <span className="text-xl md:text-2xl font-black tracking-widest opacity-25 hover:opacity-50 transition-opacity cursor-default">NEXUS</span>
                    <span className="text-xl md:text-2xl font-bold italic opacity-30 hover:opacity-60 transition-opacity cursor-default">Horizon</span>
                    <span className="text-xl md:text-2xl font-bold font-mono opacity-30 hover:opacity-60 transition-opacity cursor-default">Bolt & Co.</span>
                    <span className="text-xl md:text-2xl font-semibold opacity-30 hover:opacity-60 transition-opacity cursor-default">Starlight</span>
                </div>

                <div className="mt-12 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-sm font-medium text-blue-700 border border-blue-100/50">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Currently in Private Beta
                </div>
            </div>
        </section>
    );
}
