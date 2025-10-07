'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { fadeInUp } from '@/lib/animations/variants';

const faqs = [
  {
    question: 'How is MeetSolis different from Zoom?',
    answer:
      'MeetSolis is built specifically for freelancers and small agencies. Unlike Zoom, we offer unlimited meetings with no time limits for just $15/month, plus AI-powered meeting summaries and collaborative whiteboard features built-in.',
  },
  {
    question: 'Do I need to download any software?',
    answer:
      'No! MeetSolis runs entirely in your web browser. Just share a link and start meeting—no downloads, installations, or plugins required.',
  },
  {
    question: 'What happens after my free trial ends?',
    answer:
      "After 14 days, you can choose to subscribe to our Professional plan at $15/month. If you decide not to subscribe, you won't be charged, and your account will be downgraded to a free tier with limited features.",
  },
  {
    question: 'Can I record my meetings?',
    answer:
      'Yes! All Professional plan subscribers can record their meetings. Recordings are automatically saved to your account and can be downloaded or shared with participants.',
  },
  {
    question: 'How many participants can join a meeting?',
    answer:
      'Professional plan supports up to 100 participants per meeting, which is perfect for most freelancer and agency use cases. Need more? Contact us about custom enterprise plans.',
  },
  {
    question: 'What AI features are included?',
    answer:
      'Every meeting includes automatic transcription and AI-generated summaries with action items. Our AI analyzes the conversation and delivers a concise summary directly to your email after each call.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. All meetings use end-to-end encryption, and we comply with GDPR and SOC 2 standards. Your data is never sold to third parties, and files are automatically deleted after 30 days.',
  },
  {
    question: 'Can I integrate with my calendar?',
    answer:
      'Yes! MeetSolis integrates seamlessly with Google Calendar. Schedule meetings, send automatic reminders, and sync your availability—all from your existing calendar.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
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
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about MeetSolis
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Additional help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Still have questions?{' '}
            <a
              href="mailto:support@meetsolis.com"
              className="text-primary hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
