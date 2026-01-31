'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, Check, AlertCircle, FileSearch, Loader2, MessageSquare, Mail, Calendar, Video, FileText, PenTool, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProblemSection() {
    return (
        <section className="py-24 md:py-32 bg-[#F2F2F5]">
            <div className="container px-4 md:px-6">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 border border-slate-300/50 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-8">
                        <AlertCircle className="w-3.5 h-3.5" />
                        The Friction
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 font-heading leading-[1.1]">
                        Client context is scattered. <br className="hidden md:block" />
                        <span className="text-slate-400">Your memory shouldn't be.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                        To know what happened in the last meeting, you’re forced to dig through emails, DMs, and drive folders. Stop playing detective with your own business.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1280px] mx-auto">

                    {/* Card 01: Fragmented Context */}
                    <div className="group bg-white rounded-[32px] p-8 border border-slate-200 flex flex-col h-[520px] relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mb-6">
                            01
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Fragmented Context</h3>
                        <p className="text-slate-500 leading-relaxed max-w-xs">
                            Your client history is split across too many apps. You have to check three different places just to find the context you need.
                        </p>

                        {/* Visual: Orbiting Icons */}
                        <div className="absolute inset-x-0 bottom-0 h-[280px] bg-slate-50/50 border-t border-slate-100 flex items-center justify-center overflow-hidden rounded-b-[32px]">

                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Central Brain/Node */}
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center z-10 relative overflow-hidden">
                                    <img
                                        src="/logo.jpg"
                                        alt="Solis"
                                        className="w-10 h-10 object-contain rounded-full" // Fully rounded as requested
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                </div>

                                {/* Inner Orbit (Clockwise) */}
                                <OrbitRing size={160} duration={25} direction="clockwise">
                                    <OrbitItem angle={0} icon={MessageSquare} color="text-[#4A154B]" bg="bg-white" />
                                    <OrbitItem angle={120} icon={Mail} color="text-[#EA4335]" bg="bg-white" />
                                    <OrbitItem angle={240} icon={Video} color="text-[#0B5CFF]" bg="bg-white" />
                                </OrbitRing>

                                {/* Outer Orbit (Counter-Clockwise) */}
                                <OrbitRing size={240} duration={35} direction="counter-clockwise">
                                    <OrbitItem angle={90} icon={FileText} color="text-slate-600" bg="bg-white" />
                                    <OrbitItem angle={270} icon={PenTool} color="text-purple-500" bg="bg-white" />
                                </OrbitRing>
                            </div>
                        </div>
                    </div>

                    {/* Card 02: Zero Accountability */}
                    <div className="group bg-white rounded-[32px] p-8 border border-slate-200 flex flex-col h-[520px] relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mb-6">
                            02
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">The "Did I Promise That?" Anxiety</h3>
                        <p className="text-slate-500 leading-relaxed max-w-xs">
                            Action items get buried in the scroll. Without a central memory, you’re constantly second-guessing what you promised in that last call.
                        </p>

                        {/* Visual: Fading List */}
                        <div className="absolute inset-x-0 bottom-0 h-[280px] bg-slate-50/50 border-t border-slate-100 p-8 flex flex-col gap-4 justify-center">
                            {[
                                { text: "Send revised proposal", icon: FileText, delay: 0 },
                                { text: "Update color palette", icon: PenTool, delay: 1.5 },
                                { text: "Schedule kick-off", icon: Calendar, delay: 3 }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 1, filter: 'blur(0px)' }}
                                    animate={{
                                        opacity: [1, 1, 0.1, 0.1, 1],
                                        filter: ['blur(0px)', 'blur(0px)', 'blur(4px)', 'blur(4px)', 'blur(0px)'],
                                        scale: [1, 1, 0.98, 0.98, 1]
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        delay: item.delay,
                                        times: [0, 0.4, 0.6, 0.9, 1]
                                    }}
                                    className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <item.icon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                                </motion.div>
                            ))}

                            {/* Floating Confusion */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -4, 0]
                                }}
                                transition={{
                                    duration: 0.5,
                                    y: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                                className="absolute bottom-12 right-8 bg-slate-900 text-white px-4 py-3 rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl shadow-xl flex items-center gap-3 z-10"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-400">Project Manager</span>
                                    <span className="text-sm font-bold">Wait, who's doing this?</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Card 03: The Pre-Meeting Panic */}
                    <div className="group bg-white rounded-[32px] p-8 border border-slate-200 flex flex-col h-[520px] relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mb-6">
                            03
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">The Pre-Meeting Panic</h3>
                        <p className="text-slate-500 leading-relaxed max-w-xs">
                            You start meetings flustered, frantically tab-switching to find that one file or note from last week.
                        </p>

                        {/* Visual: The Prep Scramble */}
                        <div className="absolute inset-x-0 bottom-0 h-[280px] bg-slate-50/50 border-t border-slate-100 flex flex-col items-center justify-center overflow-hidden p-6 gap-6">

                            {/* Meeting Notification (Urgent) */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-full max-w-[260px] bg-white rounded-xl shadow-sm border border-red-100 p-3 flex items-center gap-3 z-10"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <Video className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Meeting Running</div>
                                    <div className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        Client waiting (4m)...
                                    </div>
                                </div>
                            </motion.div>

                            {/* Spotlight Search */}
                            <div className="w-full max-w-[280px] bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 p-4 z-20 flex flex-col gap-4">
                                {/* Search Bar */}
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div className="flex-1 overflow-hidden h-5 relative">
                                        {/* Typing Animation */}
                                        <motion.div
                                            animate={{ y: [0, -20, -40, 0] }} // Cycle through 3 items (h-5 = 20px)
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.33, 0.66, 1], ease: "circIn" }}
                                            className="flex flex-col gap-[3px]" // precise spacing for 20px line height approx
                                        >
                                            <span className="text-sm text-slate-400 h-5 block">proposal_v3.pdf</span>
                                            <span className="text-sm text-slate-400 h-5 block">client_brief_final.docx</span>
                                            <span className="text-sm text-slate-400 h-5 block">roadmap_2024.ppt</span>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Results (Empty) */}
                                <div className="flex flex-col gap-2 items-center py-4 opacity-50">
                                    <FileSearch className="w-8 h-8 text-slate-300" />
                                    <span className="text-xs text-slate-400">No results found</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section >
    );
}

function OrbitRing({ size, duration, direction, children }: { size: number, duration: number, direction: 'clockwise' | 'counter-clockwise', children: React.ReactNode }) {
    const rotateValue = direction === 'clockwise' ? 360 : -360;
    const counterRotateValue = direction === 'clockwise' ? -360 : 360;

    return (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/60 flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <motion.div
                className="w-full h-full relative"
                animate={{ rotate: rotateValue }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
                {/* We pass the counter-rotation info to children via context or props */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child) && child.type === OrbitItem) {
                        return React.cloneElement(child, {
                            parentRotationDuration: duration,
                            parentRotationDirection: direction,
                            parentCounterRotateValue: counterRotateValue,
                            ringSize: size // Pass ring size for positioning
                        } as any);
                    }
                    return child;
                })}
            </motion.div>
        </div>
    );
}

function OrbitItem({ angle, icon: Icon, color, bg, parentRotationDuration, parentCounterRotateValue, ringSize }: {
    angle: number,
    icon: any,
    color: string,
    bg: string,
    parentRotationDuration?: number,
    parentCounterRotateValue?: number,
    ringSize?: number
}) {
    const radius = ringSize ? ringSize / 2 : 0; // Calculate radius from ringSize

    return (
        <div
            className="absolute top-1/2 left-1/2"
            style={{
                transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`
            }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div
                    className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center border border-slate-100 shadow-sm`}
                    animate={{ rotate: parentCounterRotateValue }}
                    transition={{ duration: parentRotationDuration, repeat: Infinity, ease: "linear" }}
                >
                    <Icon className={`w-6 h-6 ${color}`} />
                </motion.div>
            </div>
        </div>
    );
}
