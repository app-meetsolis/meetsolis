'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, Check, FileText, Search, Plus, Calendar, MoreHorizontal, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SolutionSection() {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 8000); // 8 second full loop
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 bg-[#F2F2F5] relative overflow-hidden">
            <div className="container px-4 md:px-6 max-w-[1280px]">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                        <Zap className="w-3 h-3 text-slate-900" />
                        The System
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
                        Your second brain for client work.
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Solis unifies every conversation, decision, and document into one searchable timeline. Stop remembering. Start knowing.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-auto lg:h-[600px]">

                    {/* Card 1: Client Memory Hub (Large - Left) */}
                    <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-200 p-6 md:p-12 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-6 overflow-hidden shadow-sm">
                                <img src="/logo.jpg" alt="Solis" className="w-8 h-8 object-contain" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">The Client Memory Hub</h3>
                            <p className="text-slate-500 leading-relaxed max-w-md">
                                One dedicated space for every client. Keep all your meeting logs, notes, and user briefs in one place—giving you instant context whenever you need it.
                            </p>
                        </div>

                        {/* Visual: Client Card Interface */}
                        <div className="mt-12 flex-1 relative w-full flex items-center justify-center p-4">
                            <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative z-20">
                                {/* Card Header */}
                                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Apex Gear" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-lg">Apex Gear</div>
                                            <div className="text-xs text-slate-500 font-medium">Ecommerce • Q3 Campaign</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-sm">
                                            Marketing
                                        </div>
                                        <div className="p-2 hover:bg-slate-200 rounded-lg cursor-pointer">
                                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-100 bg-white">
                                    <div className="px-8 py-4 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Timeline</div>
                                    <div className="px-8 py-4 text-xs font-semibold text-slate-900 border-b-2 border-slate-900 cursor-pointer">Context</div>
                                    <div className="px-8 py-4 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Info</div>
                                </div>

                                {/* Context Content */}
                                <div className="p-5 md:p-8 bg-[#FAFAFA] flex-1 space-y-6">
                                    {/* About Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Goals</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Updated 1d ago</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 leading-relaxed min-h-[80px]">
                                            <motion.div
                                                key={`goals-${tick}`}
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: false }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {/* Text Part 1 */}
                                                {["Launch", " "].map((word, i) => (
                                                    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="mr-1">{word}</motion.span>
                                                ))}

                                                {/* Keyword 1: Summer Drop */}
                                                <motion.span
                                                    initial={{ opacity: 0, color: "#475569" }} // slate-600
                                                    animate={{ opacity: 1, color: "#0f172a" }} // slate-900 (highlight)
                                                    transition={{ delay: 0.3, duration: 0.5 }}
                                                    className="font-semibold mr-1"
                                                >
                                                    Summer Drop
                                                </motion.span>

                                                {/* Text Part 2 */}
                                                {[" ", "by", "June", "1st.", "Primary", "focus", "on", " "].map((word, i) => (
                                                    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + (i * 0.05) }} className="mr-1">{word}</motion.span>
                                                ))}

                                                {/* Keyword 2: TikTok organic */}
                                                <motion.span
                                                    initial={{ opacity: 0, backgroundColor: "transparent" }}
                                                    animate={{ opacity: 1, backgroundColor: "#fef3c7" }} // amber-100 highlight
                                                    transition={{ delay: 1.8, duration: 0.5 }}
                                                    className="font-semibold text-slate-900 px-1 rounded mx-0.5 mr-1"
                                                >
                                                    TikTok organic
                                                </motion.span>

                                                {/* Text Part 3 */}
                                                {[" ", "and", "improving", "ROAS", "by", "15%."].map((word, i) => (
                                                    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 + (i * 0.05) }} className="mr-1">{word}</motion.span>
                                                ))}
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Key People */}
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stakeholders</div>
                                            <div className="flex flex-col gap-2">
                                                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-50 shrink-0">
                                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jason" alt="Jason" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-slate-700">Jason D.</div>
                                                        <div className="text-[9px] text-slate-400">CMO</div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-pink-50 shrink-0">
                                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="Emma" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-slate-700">Emma M.</div>
                                                        <div className="text-[9px] text-slate-400">Brand Lead</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Note */}
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Sync Note</div>
                                            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-100/50 text-xs text-slate-700 h-[88px] italic relative">
                                                <div className="absolute top-2 left-2 text-amber-300">"</div>
                                                <motion.span
                                                    key={tick} // Loop Trigger
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: false }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {["Need", "final", "approval", "on", "the", "influencer", "brief", "before", "we", "sign", "the", "agency..."].map((word, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0 }}
                                                            whileInView={{ opacity: 1 }}
                                                            viewport={{ once: false }}
                                                            transition={{ delay: i * 0.1 + 0.5, duration: 0.2 }}
                                                            className="mr-1 inline-block"
                                                        >
                                                            {word}{" "}
                                                        </motion.span>
                                                    ))}
                                                </motion.span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Upload Fab */}
                                <motion.div
                                    className="absolute bottom-6 right-6 w-12 h-12 bg-slate-900 rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                                    whileHover={{ rotate: 90 }}
                                >
                                    <Plus className="w-6 h-6" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Card 2: Instant Recall (Top Right) */}
                        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 overflow-hidden">
                                        <img src="/lightning-logo.png" alt="Speed" className="w-6 h-6 object-contain" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Zero-Latency Recall</h3>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Forget searching through folders. Just ask Solis, "What did we agree on for the Q3 budget?" and get the answer instantly.
                                </p>
                            </div>

                            {/* Visual: Chat */}
                            <div className="mt-auto bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 min-h-[140px] flex flex-col justify-end">
                                <motion.div
                                    key={`q-${tick}`}
                                    className="flex justify-end"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="bg-blue-600 text-white text-xs py-2 px-3 rounded-2xl rounded-tr-sm">
                                        What's the budget for Q3?
                                    </div>
                                </motion.div>
                                <motion.div
                                    key={`a-${tick}`}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: 1.5, duration: 0.5 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-2xl rounded-tl-sm shadow-sm">
                                        Found in <span className="font-semibold underline decoration-slate-300">Strategy Sync</span>: <br />
                                        <span className="font-semibold text-slate-900">$15,000</span> approved for design.
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Card 3: Instant Action Items (Bottom Right) */}
                        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="relative z-10 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Auto-Magic Action Items</h3>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Never drop the ball again. Solis listens to your meetings and automatically extracts promises, deadlines, and next steps.
                                </p>
                            </div>

                            {/* Visual: Extraction */}
                            <div className="mt-auto relative h-24 flex items-center gap-4">
                                {/* Source */}
                                <div className="w-16 h-20 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-2 shrink-0">
                                    <FileText className="w-6 h-6 text-slate-400" />
                                    <div className="h-1 w-8 bg-slate-300 rounded-full" />
                                </div>

                                {/* Arrow */}
                                <motion.div
                                    animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
                                </motion.div>

                                {/* List */}
                                <div className="flex-1 space-y-2">
                                    {["Send invoice to accounts", "Schedule Q3 kick-off"].map((text, i) => (
                                        <motion.div
                                            key={`item-${i}-${tick}`}
                                            initial={{ opacity: 0, x: 10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: false }}
                                            transition={{ delay: i * 0.8 + 0.5, duration: 0.5 }}
                                            className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                whileInView={{ scale: 1 }}
                                                viewport={{ once: false }}
                                                transition={{ delay: i * 0.8 + 0.9, type: "spring" }}
                                                className="w-4 h-4 rounded border border-green-500 bg-green-50 flex items-center justify-center shrink-0"
                                            >
                                                <Check className="w-3 h-3 text-green-600" />
                                            </motion.div>
                                            <span className="text-xs font-medium text-slate-700">{text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
