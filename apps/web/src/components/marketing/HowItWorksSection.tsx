'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Calendar, Video, Mic, Sparkles, FileText, CheckCircle2, Zap, Check } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Works where you work',
        description: "Whether you're on Zoom, Google Meet, or a phone call. Upload any recording or transcript, and Solis instantly logs it to the client's timeline.",
        icon: Calendar,
        features: [
            "Platform agnostic (Zoom, Meet, Teams)",
            "Drag & drop audio/video uploads",
            "Enterprise-grade SOC-2 ready security"
        ]
    },
    {
        id: 2,
        title: 'Capture the nuance',
        description: "Stop taking frantic notes. Upload your recording, and Solis transcribes every word, separating the signal from the noise.",
        icon: Mic,
        features: [
            "High-fidelity transcription (99% accurate)",
            "Smart speaker identification & diatrization",
            "Works with any audio/video file"
        ]
    },
    {
        id: 3,
        title: 'Instant Recall & Action',
        description: "Walk into every meeting prepared. Solis generates a concise cheat sheet of past decisions, open tasks, and critical context.",
        icon: Sparkles,
        features: [
            "One-click executive summaries",
            "Auto-extracted action items",
            "Full context from previous calls"
        ]
    },
];

export function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(1);

    return (
        <section className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 max-w-6xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-heading">
                        Three steps to <span className="text-slate-400">total memory.</span>
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        Solis works in the background so you can stay focused in the foreground.
                    </p>
                </div>

                {/* Sticky Scroll Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                    {/* Left: Sticky Visuals (Desktop Only) */}
                    <div className="hidden lg:block lg:w-1/2 order-2 lg:order-1">
                        <div className="sticky top-32 h-[500px] w-full bg-[#FAFAFA] rounded-[32px] border border-slate-100 overflow-hidden relative shadow-2xl shadow-slate-200/50">

                            {/* Visual 1: Connect */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${activeStep === 1 ? 'opacity-100' : 'opacity-0'}`}>
                                <VisualStep1 isActive={activeStep === 1} />
                            </div>

                            {/* Visual 2: Listen */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${activeStep === 2 ? 'opacity-100' : 'opacity-0'}`}>
                                <VisualStep2 isActive={activeStep === 2} />
                            </div>

                            {/* Visual 3: Recall */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${activeStep === 3 ? 'opacity-100' : 'opacity-0'}`}>
                                <VisualStep3 isActive={activeStep === 3} />
                            </div>

                            {/* Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/50 pointer-events-none" />
                        </div>
                    </div>

                    {/* Right: Scrollable Steps */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2 py-10 lg:py-0">
                        <div className="space-y-24 lg:space-y-[500px] lg:pb-[200px]">
                            {steps.map((step) => (
                                <StepContent
                                    key={step.id}
                                    step={step}
                                    onInView={(id) => setActiveStep(id)}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function StepContent({ step, onInView }: { step: any, onInView: (id: number) => void }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-35% 0px -35% 0px" });

    useEffect(() => {
        if (isInView) {
            onInView(step.id);
        }
    }, [isInView, step.id, onInView]);

    return (
        <div ref={ref} className={`transition-opacity duration-500 ${isInView ? 'opacity-100' : 'opacity-100 lg:opacity-30 lg:blur-[1px]'}`}>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 text-white shadow-lg shadow-slate-900/20">
                {step.id === 3 ? (
                    <img src="/logo.jpg" alt="Solis" className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                    <step.icon className="w-6 h-6" />
                )}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
            <p className="text-xl text-slate-500 leading-relaxed max-w-md mb-8">
                {step.description}
            </p>
            <ul className="space-y-4 mb-12 lg:mb-0">
                {step.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                        </div>
                        {feature}
                    </li>
                ))}
            </ul>

            {/* Mobile Visual (Interleaved) */}
            <div className="block lg:hidden h-[400px] w-full bg-[#FAFAFA] rounded-[32px] border border-slate-100 overflow-hidden relative shadow-lg mt-8">
                <div className="absolute inset-0 flex items-center justify-center">
                    {step.id === 1 && <VisualStep1 isActive={true} />}
                    {step.id === 2 && <VisualStep2 isActive={true} />}
                    {step.id === 3 && <VisualStep3 isActive={true} />}
                </div>
            </div>
        </div>
    );
}

// Visual Components

// Brand Icons

function VisualStep1({ isActive }: { isActive: boolean }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Center Hub */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 rounded-full bg-white border-4 border-slate-50 shadow-2xl flex items-center justify-center z-20 relative"
            >
                <div className="absolute inset-0 rounded-full border border-slate-100" />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img
                        src="/logo.jpg"
                        alt="Solis"
                        className="w-14 h-14 object-contain rounded-full"
                    />
                </div>
            </motion.div>

            {/* Orbiting Icons */}
            {[
                { img: "/google-calendar.png", x: -120, y: -60, delay: 0 },
                { img: "/zoom.png", x: 120, y: 50, delay: 0.1 },
                { img: "/google-meet.png", x: 80, y: -90, delay: 0.2 },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={isActive ?
                        { opacity: 1, x: item.x, y: item.y } :
                        { opacity: 0, x: 0, y: 0 }
                    }
                    transition={{ duration: 0.8, delay: item.delay, type: "spring", stiffness: 100 }}
                    className="absolute w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 z-10"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    >
                        <img src={item.img} alt="Platform" className="w-10 h-10 object-contain" />
                    </motion.div>
                </motion.div>
            ))}

            {/* Smooth Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 500 500">
                {/* Line to Calendar */}
                <motion.path
                    d="M250 250 C 200 250, 180 200, 130 190"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {/* Line to Zoom */}
                <motion.path
                    d="M250 250 C 300 250, 320 300, 370 300"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                />
                {/* Line to Meet */}
                <motion.path
                    d="M250 250 C 280 250, 300 180, 330 160"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                />
            </svg>
        </div>
    )
}

function VisualStep2({ isActive }: { isActive: boolean }) {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-xs">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Recording
            </div>

            {/* Waveform */}
            <div className="flex items-center gap-1.5 h-24">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={isActive ? {
                            height: [20, Math.random() * 60 + 20, 20]
                        } : { height: 4 }}
                        transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: i * 0.05,
                            ease: "easeInOut"
                        }}
                        className="w-3 bg-slate-900 rounded-full"
                    />
                ))}
            </div>

            {/* Transcription Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
                className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-lg text-sm text-slate-500 font-medium"
            >
                <div className="flex gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">JD</div>
                    <div className="h-2 w-20 bg-slate-100 rounded-full mt-2" />
                </div>
                <div className="space-y-2 pl-9 bg-slate-50/50 p-3 rounded-lg -ml-2">
                    <TypingText text="We should aim for a Q3 launch globally." delay={0.5} />
                    <TypingText text="Agreed. Let's allocate budget for that." delay={2.5} className="text-slate-400" />
                </div>
            </motion.div>
        </div>
    )
}

function VisualStep3({ isActive }: { isActive: boolean }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                animate={isActive ? { scale: 1, opacity: 1, rotate: -3 } : { scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute w-72 h-96 bg-slate-50 border border-slate-200 rounded-2xl shadow-xl z-0"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={isActive ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative w-72 h-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col z-10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">Meeting Cheat Sheet</div>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Last discussed</div>
                        <div className="text-xs font-semibold text-slate-700">Budget constraints for Q4 marketing push.</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Action Items</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ backgroundColor: "transparent", borderColor: "#cbd5e1" }}
                                    animate={isActive ? { backgroundColor: "#22c55e", borderColor: "#22c55e" } : { backgroundColor: "transparent", borderColor: "#cbd5e1" }}
                                    transition={{ delay: 1.5, duration: 0.3 }}
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                        transition={{ delay: 1.5, type: "spring" }}
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </motion.div>
                                </motion.div>
                                <div className="text-xs text-slate-600">Review agency brief</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ backgroundColor: "transparent", borderColor: "#cbd5e1" }}
                                    animate={isActive ? { backgroundColor: "#22c55e", borderColor: "#22c55e" } : { backgroundColor: "transparent", borderColor: "#cbd5e1" }}
                                    transition={{ delay: 2.5, duration: 0.3 }}
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                        transition={{ delay: 2.5, type: "spring" }}
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </motion.div>
                                </motion.div>
                                <div className="text-xs text-slate-600">Approve final budget</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400">Generated 2m ago</div>
                </div>
            </motion.div>
        </div>
    )
}

function TypingText({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i === text.length) clearInterval(interval);
            }, 30); // Typing speed
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <div className={`text-xs font-medium leading-relaxed ${className}`}>
            {displayedText}
            <span className="animate-pulse inline-block w-1 h-3 bg-slate-400 ml-0.5 align-middle" />
        </div>
    );
}
