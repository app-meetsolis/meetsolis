'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
  delay?: number;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  popular = false,
  delay = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          Most Popular
        </Badge>
      )}
      <Card
        className={`p-8 h-full ${
          popular ? 'border-primary border-2 shadow-xl' : ''
        }`}
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-primary">{price}</span>
            <span className="text-gray-600 ml-2">{period}</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map(feature => (
            <li key={feature} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <Link href="/sign-up" className="block">
          <Button
            size="lg"
            variant={popular ? 'default' : 'outline'}
            className="w-full"
          >
            {cta}
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
