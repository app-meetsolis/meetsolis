'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { WaitlistModal } from '@/components/waitlist/WaitlistModal';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pt-[calc(2rem+env(safe-area-inset-top))] md:pt-8">
      <motion.div
        initial={{
          maxWidth: '1200px',
          borderRadius: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          backdropFilter: 'blur(0px)',
          border: '1px solid transparent',
          boxShadow: 'none',
          padding: '1.25rem 1.5rem',
        }}
        animate={{
          maxWidth: scrolled ? '800px' : '1200px',
          borderRadius: scrolled ? '9999px' : '24px',
          backgroundColor: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          border: scrolled
            ? '1px solid rgba(226, 232, 240, 0.6)'
            : '1px solid transparent',
          boxShadow: scrolled
            ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            : 'none',
          padding: scrolled ? '0.75rem 1.5rem' : '1.25rem 1.5rem',
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="pointer-events-auto flex items-center justify-between mx-auto w-full"
        style={{
          width: '100%',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 md:mr-8 shrink-0">
          <img
            src="/logo.jpg"
            alt="MeetSolis Logo"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <span className="text-2xl font-bold tracking-tight text-slate-900 transition-colors">
            MeetSolis
          </span>
        </Link>

        {/* Navigation - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 mr-8">
          <NavLink href="#problem" label="Problem" scrolled={scrolled} />
          <NavLink href="#features" label="Features" scrolled={scrolled} />
          <NavLink
            href="#how-it-works"
            label="How it Works"
            scrolled={scrolled}
          />
          <NavLink href="#faq" label="FAQ" scrolled={scrolled} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {isSignedIn ? (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all font-medium text-xs md:text-sm px-4 md:px-6 h-9"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <WaitlistModal>
              <Button
                size="sm"
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all font-medium text-xs md:text-sm px-5 h-9"
              >
                Join the waitlist
              </Button>
            </WaitlistModal>
          )}
        </div>
      </motion.div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  scrolled,
}: {
  href: string;
  label: string;
  scrolled: boolean;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      {label}
    </Link>
  );
}
