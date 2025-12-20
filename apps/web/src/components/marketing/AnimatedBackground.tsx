'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Calendar,
  Video,
  CheckCircle,
  Shield,
} from 'lucide-react';

export function AnimatedBackground() {
  const floatingIcons = [
    {
      Icon: FileText,
      x: '10%',
      y: '20%',
      delay: 0,
      duration: 8,
      size: 24,
      color: 'text-blue-500',
    },
    {
      Icon: Users,
      x: '85%',
      y: '15%',
      delay: 2,
      duration: 10,
      size: 32,
      color: 'text-indigo-500',
    },
    {
      Icon: Calendar,
      x: '15%',
      y: '70%',
      delay: 1,
      duration: 9,
      size: 28,
      color: 'text-purple-500',
    },
    {
      Icon: Video,
      x: '80%',
      y: '65%',
      delay: 3,
      duration: 11,
      size: 36,
      color: 'text-pink-500',
    },
    {
      Icon: CheckCircle,
      x: '5%',
      y: '45%',
      delay: 0.5,
      duration: 7,
      size: 20,
      color: 'text-green-500',
    },
    {
      Icon: Shield,
      x: '90%',
      y: '40%',
      delay: 2.5,
      duration: 9.5,
      size: 24,
      color: 'text-cyan-500',
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Grid - Tinted Blue for visibility */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB15_1px,transparent_1px),linear-gradient(to_bottom,#2563EB15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Soft Gradient Globs - Increased Opacity for Glass Effect */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/30 rounded-full blur-[120px] opacity-40 animate-pulse delay-700" />

      {/* Floating Elements - Solid Chips for Maximum Visibility */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          // Alternating styles: Even indices get Solid Primary, Odd get Light Blue
          style={{
            left: item.x,
            top: item.y,
            // @ts-ignore
            '--size': `${item.size}px`,
          }}
          className={`absolute flex items-center justify-center rounded-2xl shadow-lg
            w-[calc(var(--size)*2.5)] h-[calc(var(--size)*2.5)] 
            md:w-[calc(var(--size)*4.5)] md:h-[calc(var(--size)*4.5)]
            ${
              index % 2 === 0
                ? 'bg-primary text-white border-transparent'
                : 'bg-blue-100 text-primary border border-blue-200'
            }
          `}
          initial={{ opacity: 1, y: 20, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: [0, -35, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          <item.Icon className="w-1/2 h-1/2" />
        </motion.div>
      ))}
    </div>
  );
}
