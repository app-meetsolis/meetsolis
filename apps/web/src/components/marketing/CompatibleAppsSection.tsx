'use client';

import { motion } from 'framer-motion';

export function CompatibleAppsSection() {
    const apps = ['Zoom', 'Google Workspace', 'Slack', 'Outlook', 'Microsoft Teams'];
    // Duplicate apps to create seamless loop
    const marqueeContent = [...apps, ...apps, ...apps, ...apps];

    return (
        <section className="py-12 bg-[#0B0F19] border-b border-white/5 overflow-hidden relative">
            <div className="container px-4 md:px-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10">
                    Works seamlessly with
                </p>

                <div className="relative max-w-5xl mx-auto overflow-hidden">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B0F19] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B0F19] to-transparent z-10 pointer-events-none" />

                    {/* Marquee Track */}
                    <motion.div
                        className="flex gap-16 w-fit pl-16 cursor-grab active:cursor-grabbing"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                    >
                        {marqueeContent.map((app, i) => (
                            <span
                                key={i}
                                className="text-xl md:text-2xl font-bold text-slate-400 whitespace-nowrap shrink-0 hover:text-slate-600 transition-colors"
                            >
                                {app}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
