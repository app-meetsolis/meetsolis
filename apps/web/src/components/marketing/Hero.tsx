'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Star, Globe, Video, Clock, StarHalf } from 'lucide-react';
import { WaitlistModal } from '@/components/waitlist/WaitlistModal';

export function Hero() {
  return (
    <section className="relative w-full min-h-screen pt-28 md:pt-32 pb-12 flex items-center justify-center bg-[#F2F2F5] overflow-hidden">

      {/* Background Decor can be kept minimal/removed for Cal vibe, sticking to solid grey for now or subtle pattern */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 w-full max-w-[1440px]">
        {/* Main Card Container */}
        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-[32px] md:rounded-[48px] shadow-sm border border-slate-200/60 p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >

          {/* LEFT: Text Content */}
          <div className="flex-1 flex flex-col items-start text-left space-y-8">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-1.5 py-1.5 pr-3 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10 cursor-default hover:scale-105 transition-transform"
            >
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold tracking-wide uppercase">New</span>
              <span className="text-xs font-medium text-slate-200">Solis 2.0 Beta</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </motion.div>

            <div className="space-y-4 max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 leading-[0.95] font-heading"
              >
                The AI Client Memory that remembers everything for you.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg font-body"
              >
                Built for freelancers and agencies, Solis captures every detail, decision, and todo. Forget something? Just ask Solis for instant context and prepare for meetings instantly.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <WaitlistModal>
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Join the waitlist
                </Button>
              </WaitlistModal>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-2 text-xs text-slate-400 font-medium"
            >
              <span className="inline-block w-4 h-4 rounded-full bg-green-100 border border-green-200 text-green-600 flex items-center justify-center mr-1">✓</span>
              No credit card required
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
              Free for early beta users
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="pt-8 mt-auto hidden lg:block"
            >
              <div className="flex items-center gap-4">
                <AnimatedAvatarStack />
                <div>
                  <div className="flex gap-0.5 text-orange-400 mb-0.5">
                    {[1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <div className="relative">
                      <Star className="w-4 h-4 text-slate-300 fill-slate-300" />
                      <StarHalf className="w-4 h-4 fill-current absolute top-0 left-0" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Loved by 100+ freelancers & agencies</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT: UI Visual (Cal.com style card) */}
          <div className="flex-1 w-full relative">
            <div className="relative rounded-[24px] bg-[#F9FAFB] border border-slate-200 p-6 md:p-8 shadow-sm">

              {/* Visual Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden p-1">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jake" alt="Client" className="w-full h-full rounded-xl bg-indigo-50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">Pre-meeting Brief</p>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sync with Alex</h3>
                    <p className="text-sm text-slate-400">Apex Design • Weekly Design Review</p>
                  </div>
                </div>
              </div>

              {/* Main Content Card (The "Brief") */}
              <div className="space-y-4">

                {/* Time/Platform Chips */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    15m
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    <Video className="w-3.5 h-3.5" />
                    Zoom
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                    Global
                  </div>
                </div>

                {/* Context Cards (Carousel) */}
                <ContextCarousel />

              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full blur-3xl opacity-50 z-0" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 z-0" />

            </div>
          </div>

        </motion.div>

        {/* LOGOS STRIP */}


      </div >
    </section >
  );
}

// --- CAROUSEL COMPONENTS ---

const CARDS = [
  {
    id: 1,
    type: 'interaction',
    label: 'Last Interaction',
    subLabel: '2 days ago',
    content: '"Alex approved the wireframes but asked for reduced padding on the mobile view. He also mentioned Q3 budget is approved."',
    borderColor: 'border-l-indigo-500',
  },
  {
    id: 2,
    type: 'action',
    label: 'You promised',
    subLabel: 'Action Item',
    content: 'Send the updated prototype link',
    borderColor: 'border-l-indigo-500',
  },
  {
    id: 3,
    type: 'action',
    label: 'Solis Suggestion',
    subLabel: 'high priority',
    content: 'Draft invoice for Q3 Deposit',
    borderColor: 'border-l-amber-500',
  },
];

function ContextCarousel() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CARDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const visibleCards = [
    CARDS[index % CARDS.length],
    CARDS[(index + 1) % CARDS.length],
  ];

  return (
    <div className="relative h-[220px] overflow-hidden flex flex-col gap-2 mask-top-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleCards.map((card, i) => (
          <CarouselCard
            key={card.id}
            item={card}
            isBottom={i === 1}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

const CarouselCard = React.forwardRef<HTMLDivElement, { item: typeof CARDS[0], isBottom: boolean }>(
  ({ item, isBottom }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.5 } }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative z-10 w-full"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{item.label}</span>
          <span className="text-[10px] text-slate-400">{item.subLabel}</span>
        </div>

        {item.type === 'interaction' ? (
          <div className={`text-sm text-slate-600 leading-relaxed border-l-2 ${item.borderColor} pl-3 py-1 min-h-[40px]`}>
            <TypingText text={item.content} />
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1">
            <AnimatedCheckbox isBottom={isBottom} />
            <span className="text-sm text-slate-700 font-medium">{item.content}</span>
          </div>
        )}
      </motion.div>
    )
  }
);
CarouselCard.displayName = 'CarouselCard';

function AnimatedCheckbox({ isBottom }: { isBottom: boolean }) {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-full border-2 border-slate-300" />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: isBottom ? 1.5 : 0,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="absolute inset-0 rounded-full flex items-center justify-center bg-green-500"
      >
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </motion.div>
    </div>
  );
}

function TypingText({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="inline-block"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0,
            delay: i * 0.03 + 0.5,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function AnimatedAvatarStack() {
  const [avatars, setAvatars] = React.useState([
    { id: 1, seed: 1 },
    { id: 2, seed: 2 },
    { id: 3, seed: 3 },
    { id: 4, seed: 4 },
    { id: 5, seed: 5 }
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAvatars(prev => {
        const nextId = Date.now();
        const nextSeed = Math.floor(Math.random() * 100) + 6;
        const newAvatars = [{ id: nextId, seed: nextSeed }, ...prev];
        return newAvatars.slice(0, 5);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex -space-x-3 w-[160px] overflow-visible pointer-events-none">
      <AnimatePresence mode="popLayout" initial={false}>
        {avatars.map((item, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden relative z-10 shadow-sm shrink-0"
            style={{ zIndex: 10 - i }}
          >
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`} alt="user" className="w-full h-full" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
