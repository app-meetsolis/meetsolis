'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from './AnimatedBackground';
import { LottiePlaceholder } from './LottiePlaceholder';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Layer: z-0 */}
      <AnimatedBackground />

      {/* Content Layer: z-10 */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border/60 shadow-sm text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            New: Enhanced Client Management
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Stop Just Meeting.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Start Managing.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The video conferencing tool built for freelancers. Create dedicated
            Client Cards, save your presentations, and launch context-rich calls
            in one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            >
              <Link href="/sign-up">
                Get MeetSolis Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full bg-white/50 border-2 hover:bg-white hover:border-primary/20 text-lg font-medium hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              <PlayCircle className="w-5 h-5 mr-2 text-primary" />
              See how it works
            </Button>
          </div>
        </div>

        {/* Hero Media / Lottie */}
        <div className="relative max-w-6xl mx-auto rounded-[32px] p-2 bg-gradient-to-b from-white/60 to-white/20 backdrop-blur-xl border border-white/50 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-white shadow-inner">
            {/* 
                PRD Requirement: 
                The Animation: The animation starts with a messy desktop of scattered files. 
                A cursor clicks a button, and the files suck into a neat, glowing card labeled "Client: Acme Corp". 
                The card expands, the webcam activates, and a meeting starts.
             */}
            <LottiePlaceholder
              label="Hero Animation: Desktop to Client Card Transformation"
              className="w-full h-full bg-transparent border-0"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-secondary/30 rounded-full blur-[40px] animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-[50px] animate-pulse delay-1000" />
        </div>
      </div>
    </section>
  );
}
