'use client';

import { LottiePlaceholder } from './LottiePlaceholder';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Onboard',
    description:
      'Start every relationship on the right foot. Create a dedicated Client Card in seconds, upload their branding, and set the stage for a premium experience that impresses from day one.',
    features: [
      'One-click workspace creation',
      'Auto-fetch brand logos',
      'Customizable welcome environments',
    ],
    visual: 'Onboard Animation',
  },
  {
    id: 2,
    title: 'Prepare',
    description:
      "Never scramble for files again. Upload pitch decks, contracts, and agenda notes directly to the client's card. Everything you need is context-aware and ready the moment you join the call.",
    features: [
      'Context-aware file storage',
      'Instant agenda syncing',
      'Pre-meeting briefing summaries',
    ],
    visual: 'Upload Animation',
  },
  {
    id: 3,
    title: 'Present',
    description:
      'Deliver flawless presentations with a meeting interface designed for closers. Your pitch deck is front and center, while your notes stay private. Engage clients with interactive tools that feel like magic.',
    features: [
      'Presenter mode with private notes',
      'High-definition screen sharing',
      'Interactive pointers & annotations',
    ],
    visual: 'Present Animation',
  },
  {
    id: 4,
    title: 'Follow up',
    description:
      'Turn meetings into momentum. Solis automatically generates recording summaries, action items, and follow-up emails. Send a professional wrap-up package with a single click.',
    features: [
      'AI-generated meeting summaries',
      'One-click email drafts',
      'Searchable call transcripts',
    ],
    visual: 'Follow up Animation',
  },
];

export function WorkflowScroll() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      // Use requestAnimationFrame for smoother performance
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const availableScroll = rect.height - viewportHeight;
        const scrolled = Math.max(0, -rect.top);

        const progress = Math.max(0, Math.min(1, scrolled / availableScroll));
        const currentStep = Math.min(
          steps.length - 1,
          Math.floor(progress * steps.length)
        );

        setActiveStep(currentStep);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    // Increased height slightly to accommodate richer content reading time
    <section ref={sectionRef} className="bg-white relative min-h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center h-full">
            {/* Left Column: Rich Interactive Steps */}
            <div className="space-y-12 max-w-xl">
              <div className="mb-10">
                <span className="text-primary font-bold tracking-wider uppercase text-xs md:text-sm bg-primary/5 px-4 py-2 rounded-full">
                  Workflow Optimized
                </span>
                <h2 className="text-4xl md:text-6xl font-bold mt-6 leading-tight">
                  Simplify your <br />{' '}
                  <span className="text-muted-foreground/30">
                    client workflow.
                  </span>
                </h2>
              </div>

              <div className="space-y-8 relative pl-4">
                {/* Connecting Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-border via-border to-transparent -z-10" />

                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex gap-8 transition-all duration-500 group',
                      index === activeStep
                        ? 'opacity-100'
                        : 'opacity-40 hover:opacity-60'
                    )}
                  >
                    {/* Number Bubble */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-500 bg-white shrink-0 z-10',
                        index === activeStep
                          ? 'border-primary text-primary shadow-[0_0_20px_rgba(93,95,239,0.3)] scale-110'
                          : 'border-border text-muted-foreground group-hover:border-primary/30'
                      )}
                    >
                      {step.id}
                    </div>

                    {/* Content */}
                    <div className="pt-2">
                      <h3
                        className={cn(
                          'text-2xl font-bold mb-3 transition-colors',
                          index === activeStep
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </h3>

                      <div
                        className={cn(
                          'transition-all duration-500 ease-in-out overflow-hidden will-change-[max-height,opacity]',
                          index === activeStep
                            ? 'max-h-[500px] opacity-100 translate-y-0'
                            : 'max-h-0 opacity-0 -translate-y-4'
                        )}
                      >
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                          {step.description}
                        </p>

                        {/* Feature List */}
                        <ul className="space-y-3">
                          {step.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-sm font-medium text-foreground/80"
                            >
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="h-[500px] w-full relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-primary/5 to-transparent rounded-[3rem] transform rotate-3 scale-105 opacity-60 blur-2xl" />

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'absolute inset-0 transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) transform will-change-transform',
                    index === activeStep
                      ? 'opacity-100 translate-y-0 scale-100 z-10 blur-0'
                      : index < activeStep
                        ? 'opacity-0 -translate-y-20 scale-90 z-0 blur-sm'
                        : 'opacity-0 translate-y-20 scale-90 z-0 blur-sm'
                  )}
                >
                  <div className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl bg-white border border-black/5 p-4 box-border ring-1 ring-black/5">
                    <div className="w-full h-full bg-gray-50/50 rounded-[24px] overflow-hidden relative">
                      <LottiePlaceholder
                        label={step.visual}
                        className="h-full bg-transparent border-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
