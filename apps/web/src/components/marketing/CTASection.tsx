'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/variants';
import { analytics } from '@/lib/analytics';
import { useUser } from '@clerk/nextjs';

export function CTASection() {
  const { isSignedIn } = useUser();

  const handleCTAClick = () => {
    analytics.track('landing_page_cta_clicked', {
      cta_location: 'footer_cta',
      cta_text: isSignedIn ? 'Go to Dashboard' : 'Start Free Trial',
    });
  };
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your meetings?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your 14-day free trial today. No credit card required. Cancel
            anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={isSignedIn ? '/dashboard' : '/sign-up'}
              onClick={handleCTAClick}
            >
              <Button
                size="lg"
                variant="secondary"
                className="group bg-white text-primary hover:bg-gray-100"
              >
                {isSignedIn ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            Join 5,000+ freelancers and agencies already using MeetSolis
          </p>
        </motion.div>
      </div>
    </section>
  );
}
