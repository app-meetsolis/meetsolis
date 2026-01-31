'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, CheckSquare, Mail, MessageSquare, Clock } from 'lucide-react';

const FLOATING_ITEMS = [
    { id: 1, label: "Meeting Notes", icon: FileText, x: -180, y: -80, rotate: -12, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: 2, label: "Q4 Budget", icon: CheckSquare, x: 160, y: -90, rotate: 15, color: "bg-green-50 text-green-600 border-green-100" },
    { id: 3, label: "Client Email", icon: Mail, x: -140, y: 80, rotate: -8, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { id: 4, label: "Briefing Doc", icon: FileText, x: 180, y: 60, rotate: 10, color: "bg-orange-50 text-orange-600 border-orange-100" },
    { id: 5, label: "Follow-up", icon: Clock, x: -20, y: -120, rotate: 5, color: "bg-pink-50 text-pink-600 border-pink-100" },
    { id: 6, label: "Feedback", icon: MessageSquare, x: 20, y: 130, rotate: -6, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

export function OrganizeSection() {
    return (
        <section className="py-24 mb-20 bg-[#F2F2F5] overflow-visible">
            <div className="container px-4 md:px-6">
                <div className="flex justify-center">
                    <motion.div
                        className="relative w-full max-w-[600px] h-[250px] flex items-center justify-center cursor-pointer group"
                        initial="idle"
                        whileHover="hover"
                        animate="idle"
                    >
                        {/* Central Hub Button */}
                        <div className="relative z-20">
                            <motion.div
                                className="px-10 py-5 bg-slate-900 rounded-full shadow-2xl flex items-center gap-3 relative overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                    Organize your client memory
                                </span>
                            </motion.div>
                        </div>

                        {/* Floating Clutter Items */}
                        {FLOATING_ITEMS.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`absolute px-4 py-2.5 rounded-xl border shadow-sm flex items-center gap-2 pointer-events-none z-10 ${item.color}`}
                                variants={{
                                    idle: {
                                        x: item.x,
                                        y: item.y,
                                        rotate: item.rotate,
                                        scale: 1,
                                        opacity: 1,
                                        transition: {
                                            type: "spring",
                                            mass: 0.8,
                                            stiffness: 100,
                                            damping: 15
                                        }
                                    },
                                    hover: {
                                        x: 0,
                                        y: 0,
                                        rotate: 0,
                                        scale: 0.5,
                                        opacity: 0,
                                        transition: {
                                            duration: 0.4,
                                            ease: "anticipate" // Pull-in effect
                                        }
                                    }
                                }}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
                            </motion.div>
                        ))}

                        {/* Optional: Subtle connecting lines fading out on hover */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
                            {FLOATING_ITEMS.map((item, i) => (
                                <motion.line
                                    key={i}
                                    x1="50%"
                                    y1="50%"
                                    x2={`calc(50% + ${item.x}px)`}
                                    y2={`calc(50% + ${item.y}px)`}
                                    stroke="currentColor"
                                    className="text-slate-300"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    variants={{
                                        idle: { opacity: 1, pathLength: 1 },
                                        hover: { opacity: 0, pathLength: 0 }
                                    }}
                                />
                            ))}
                        </svg>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
