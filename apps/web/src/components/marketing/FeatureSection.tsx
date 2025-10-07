'use client';

import { motion } from 'framer-motion';
import {
  Video,
  Brain,
  Share2,
  Palette,
  FileText,
  Calendar,
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { fadeInUp } from '@/lib/animations/variants';

const features = [
  {
    icon: Video,
    title: 'HD Video Calls',
    description:
      'Crystal clear video quality with adaptive bitrate for smooth calls even on slower connections.',
  },
  {
    icon: Brain,
    title: 'AI Meeting Summaries',
    description:
      'Automatic transcription and AI-generated summaries with action items delivered after each call.',
  },
  {
    icon: Palette,
    title: 'Collaborative Whiteboard',
    description:
      'Brainstorm together with a real-time whiteboard powered by Excalidraw. Perfect for design sessions.',
  },
  {
    icon: Share2,
    title: 'Screen Sharing',
    description:
      'Share your entire screen or specific windows with one click. Perfect for presentations and demos.',
  },
  {
    icon: FileText,
    title: 'File Sharing',
    description:
      'Send files instantly during calls. Up to 10GB storage with automatic cleanup after 30 days.',
  },
  {
    icon: Calendar,
    title: 'Calendar Integration',
    description:
      'Seamlessly sync with Google Calendar. Schedule meetings and send automatic reminders.',
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-gray-50">
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
            Everything you need for professional meetings
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for freelancers, consultants, and small agencies who need
            powerful features without enterprise complexity.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
