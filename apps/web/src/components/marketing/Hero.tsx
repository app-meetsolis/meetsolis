'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fadeInUp, fadeInDown } from '@/lib/animations/variants';
import { ArrowRight } from 'lucide-react';
import { DemoModal } from './DemoModal';
import { analytics } from '@/lib/analytics';

export function Hero() {
  const handleCTAClick = () => {
    analytics.track('landing_page_cta_clicked', {
      cta_location: 'hero',
      cta_text: 'Start Free Trial',
    });
  };
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInDown}
              className="inline-block mb-4 px-4 py-2 bg-accent/10 rounded-full"
            >
              <span className="text-sm font-medium text-primary">
                🚀 Now in Beta - Start Free Trial
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Professional Video Meetings for{' '}
              <span className="text-primary">Freelancers & Agencies</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              HD calls, AI summaries, and collaborative tools—without
              Zoom&apos;s price tag. Unlimited meetings from just $15/month.
            </motion.p>

            {/* Value props */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 text-sm"
            >
              <div className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Unlimited meetings
              </div>
              <div className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No time limits
              </div>
              <div className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No downloads required
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/sign-up" onClick={handleCTAClick}>
                <Button size="lg" className="group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <DemoModal />
            </motion.div>
          </motion.div>

          {/* Right column - Hero image placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative aspect-video rounded-lg shadow-2xl bg-gradient-to-br from-primary to-secondary overflow-hidden">
              {/* Placeholder for hero image/screenshot */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                Platform Screenshot
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
