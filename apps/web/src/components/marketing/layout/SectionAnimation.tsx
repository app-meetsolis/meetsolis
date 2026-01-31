'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionAnimationProps {
    children: ReactNode;
    className?: string; // Allow passing external classes (like id, scroll-mt, etc)
    delay?: number;
}

export function SectionAnimation({ children, className, delay = 0.1 }: SectionAnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for "beautiful" feel
                delay: delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
