'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Freelance Designer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        content: "Solis has completely changed how I handle client meetings. I no longer panic about forgetting details. It's like having a second brain that never sleeps.",
        stars: 5
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Marketing Consultant",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        content: "The automatic action items are a lifesaver.",
        stars: 5
    },
    {
        id: 3,
        name: "Jessica Ford",
        role: "Product Manager",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        content: "Zero-latency recall is real. Being able to ask 'what was the budget?' during a call is magical. I honestly don't know how I managed multiple stakeholders without this tool before.",
        stars: 5
    },
    {
        id: 4,
        name: "David Ross",
        role: "Agency Owner",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        content: "Reliable. Fast. Secure.",
        stars: 4
    },
    {
        id: 5,
        name: "Emily White",
        role: "Copywriter",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        content: "The transcriptions are spot on, but the context extraction is what really sets Solis apart. It understands nuance better than most assistants I've hired.",
        stars: 5
    },
];

export function ReviewSection() {
    return (
        <section className="py-24 bg-[#0B0F19] text-white relative overflow-hidden border-b border-white/5">

            <div className="container px-4 md:px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-heading">
                    Loved by <span className="text-blue-400">client-facing</span> pros.
                </h2>
                <p className="text-slate-400 text-lg">
                    Join freelancers and agencies who trust Solis with their client relationships.
                </p>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden py-10">

                {/* Gradient Masks/Foggy Edges */}
                <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#0B0F19] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#0B0F19] to-transparent z-10 pointer-events-none" />

                <div className="flex gap-8 w-max">
                    <MarqueeGroup />
                    <MarqueeGroup />
                    <MarqueeGroup />
                </div>
            </div>

        </section>
    );
}

function MarqueeGroup() {
    return (
        <motion.div
            className="flex gap-8 shrink-0"
            animate={{ x: "-100%" }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
            {REVIEWS.map((review) => (
                <div
                    key={review.id}
                    className="w-[350px] md:w-[450px] bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col justify-between"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                            <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-bold text-white">{review.name}</div>
                            <div className="text-xs text-blue-400 font-medium">{review.role}</div>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                        "{review.content}"
                    </p>
                </div>
            ))}
        </motion.div>
    )
}
