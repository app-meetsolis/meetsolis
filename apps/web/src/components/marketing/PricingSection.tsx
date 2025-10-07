'use client';

import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { fadeInUp } from '@/lib/animations/variants';

const pricingTiers = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '14 days',
    features: [
      'All Professional features',
      'Unlimited HD video meetings',
      'No time limits',
      'AI meeting summaries',
      'Collaborative whiteboard',
      'Screen sharing',
      'File sharing (10GB)',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$15',
    period: '/month',
    features: [
      'Unlimited HD video meetings',
      'No time limits',
      'AI meeting summaries',
      'Collaborative whiteboard',
      'Screen sharing',
      'File sharing (10GB)',
      'Calendar integration',
      'Priority email support',
      '30-day money-back guarantee',
    ],
    cta: 'Get Started',
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel
            anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              features={tier.features}
              cta={tier.cta}
              popular={tier.popular}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Comparison with Zoom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-accent/10 rounded-lg p-6 max-w-2xl">
            <p className="text-lg text-gray-700">
              <strong>Save over $200/year</strong> compared to Zoom&apos;s
              $15.99/user/month plan. Plus, you get AI summaries and unlimited
              participants.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
