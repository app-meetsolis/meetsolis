'use client';

import { motion } from 'framer-motion';
import { TestimonialCard } from './TestimonialCard';
import { fadeInUp } from '@/lib/animations/variants';

const testimonials = [
  {
    quote:
      "MeetSolis has been a game-changer for my consulting business. Unlimited meetings for a fraction of Zoom's cost, and the AI summaries save me hours every week.",
    author: 'Sarah Johnson',
    role: 'Marketing Consultant',
    rating: 5,
  },
  {
    quote:
      'The AI summaries are incredible. I can focus on my clients instead of taking notes. The whiteboard feature is perfect for design collaboration sessions.',
    author: 'Michael Chen',
    role: 'Business Coach',
    rating: 5,
  },
  {
    quote:
      'My agency switched from Zoom and saved $500/month while getting better features. The calendar integration works flawlessly with our workflow.',
    author: 'Emma Rodriguez',
    role: 'Creative Agency Owner',
    rating: 5,
  },
];

export function TestimonialSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gray-50">
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
            Trusted by professionals worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of freelancers and agencies who have made the switch
            to MeetSolis.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              rating={testimonial.rating}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                15,000+
              </div>
              <div className="text-gray-600">Meetings Hosted Monthly</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
