'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Sarah J.',
    role: 'Brand Designer',
    company: 'Freelance',
    quote:
      "I used to spend 10 minutes finding files before every call. With MeetSolis, I open the client card and I'm ready. It makes me look so professional.",
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Developer',
    company: 'TechFlow',
    quote:
      'The seamless recording and note-taking features have saved me hours of follow-up work. My clients love the organized summaries.',
    avatar: '/avatars/michael.jpg',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Consultant',
    company: 'GrowthLabs',
    quote:
      'Finally, a video tool that understands how freelancers work. The client card system is a game-changer for managing multiple accounts.',
    avatar: '/avatars/elena.jpg',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'UX Researcher',
    company: 'UserFirst',
    quote:
      'The video quality is pristine and the interface is beautiful. It makes every client interaction feel premium.',
    avatar: '/avatars/david.jpg',
  },
  {
    id: 5,
    name: 'Jessica Lee',
    role: 'Copywriter',
    company: 'CreativeInk',
    quote:
      'MeetSolis completely transformed my client onboarding process. The specialized workspace makes everything feel bespoke.',
    avatar: '/avatars/jessica.jpg',
  },
];

export function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(1);

  const next = () => {
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveIndex(
      prev => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  // Calculate indices for visible cards
  const getVisibleIndices = () => {
    const total = testimonials.length;
    const prevIndex = (activeIndex - 1 + total) % total;
    const nextIndex = (activeIndex + 1) % total;
    return { prevIndex, activeIndex, nextIndex };
  };

  const { prevIndex, nextIndex } = getVisibleIndices();

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Loved by freelancers.
        </h2>

        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {testimonials.map((testimonial, index) => {
              // Determine position relative to active index
              let position = 0; // 0 = active, -1 = prev, 1 = next, 2 = hidden
              if (index === activeIndex) position = 0;
              else if (index === prevIndex) position = -1;
              else if (index === nextIndex) position = 1;
              else position = 100; // Hidden

              if (position === 100) return null;

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{
                    opacity: 0,
                    x: position === -1 ? -100 : position === 1 ? 100 : 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: position === 0 ? 1 : 0.4,
                    scale: position === 0 ? 1 : 0.85,
                    x: position === 0 ? '0%' : position === -1 ? '-55%' : '55%',
                    zIndex: position === 0 ? 20 : 10,
                    filter: position === 0 ? 'blur(0px)' : 'blur(4px)',
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute w-[90%] md:w-[60%] lg:w-[500px] bg-[#F0F4FF] rounded-[32px] p-8 md:p-12 text-center shadow-lg border border-primary/5 cursor-pointer"
                  onClick={() => {
                    if (position === -1) prev();
                    if (position === 1) next();
                  }}
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <Quote className="w-6 h-6 text-primary fill-primary/20" />
                    </div>

                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/90">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    <div className="flex flex-col items-center">
                      <Avatar className="w-12 h-12 mb-2 border-2 border-white shadow-sm">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {testimonial.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-bold text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-[10%] z-30">
            <Button
              onClick={prev}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white shadow-lg border-border hover:bg-gray-50 hover:scale-105 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-[10%] z-30">
            <Button
              onClick={next}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white shadow-lg border-border hover:bg-gray-50 hover:scale-105 transition-all"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                idx === activeIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/20 hover:bg-primary/40'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
