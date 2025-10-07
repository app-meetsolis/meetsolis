'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating?: number;
  delay?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  rating = 5,
  delay = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-shadow">
        {/* Rating */}
        <div className="flex mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 text-accent fill-accent"
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-gray-700 mb-6 italic">
          &quot;{quote}&quot;
        </blockquote>

        {/* Author */}
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-4 bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {author.charAt(0)}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">{author}</div>
            <div className="text-sm text-gray-600">{role}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
