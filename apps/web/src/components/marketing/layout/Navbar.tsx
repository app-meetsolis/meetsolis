'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#use-cases', label: 'Use Cases' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          top: scrolled ? 24 : 0,
          maxWidth: scrolled ? '64rem' : '100%',
          paddingLeft: scrolled ? '0px' : '0px',
          paddingRight: scrolled ? '0px' : '0px',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 right-0 z-50 mx-auto transition-all duration-300',
          scrolled ? 'px-4 md:px-0' : 'px-0'
        )}
      >
        <div
          className={cn(
            'transition-all duration-500 flex items-center justify-between',
            scrolled
              ? 'rounded-full border px-6 py-4 bg-white/80 backdrop-blur-xl border-border/40 shadow-lg supports-[backdrop-filter]:bg-white/60'
              : 'rounded-none border-b border-white/10 px-6 py-4 md:px-12 md:py-6 bg-white/50 backdrop-blur-md'
          )}
        >
          {/* Logo - Larger Text */}
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2">
              <span
                className={cn(
                  'font-bold tracking-tight text-foreground transition-all duration-300',
                  scrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
                )}
              >
                MeetSolis
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered & Larger */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-10">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions & Mobile Toggle */}
          <div className="flex items-center justify-end flex-1 gap-4">
            {isSignedIn ? (
              <Button
                asChild
                className={cn(
                  'bg-gradient-to-r from-primary to-accent border-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300 px-6 hidden sm:flex',
                  scrolled ? 'rounded-full' : 'rounded-lg'
                )}
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className={cn(
                    'bg-gradient-to-r from-primary to-accent border-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300 px-6 hidden sm:flex',
                    scrolled ? 'rounded-full' : 'rounded-lg'
                  )}
                >
                  <Link href="/sign-up">Start Free Meeting</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl md:hidden flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                MeetSolis
              </span>
              <button
                className="p-2 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-8 items-center justify-center flex-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-12 h-[1px] bg-border my-4" />
              {isSignedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full w-full max-w-xs bg-gradient-to-r from-primary to-accent shadow-xl"
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-xl font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full w-full max-w-xs bg-gradient-to-r from-primary to-accent shadow-xl"
                  >
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Start Free Meeting
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
