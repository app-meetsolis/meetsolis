'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do I need to switch from Zoom or Google Meet?',
    answer:
      "Not at all. Solis is not a video platform—it's a memory layer. You keep meeting where you meet, and use Solis to store and recall the context.",
  },
  {
    question: 'Which platforms do you support?',
    answer:
      'Since we work via file upload, we support everything. Zoom, Google Meet, Teams, or even a voice memo on your phone. If you can record it, Solis can analyze it.',
  },
  {
    question: 'Is my client data secure?',
    answer:
      'Yes. Your data is encrypted and isolated. We never use your client data to train our public models. You own your memory hub.',
  },
  {
    question: 'Can I import past meetings?',
    answer:
      'Absolutely. You can bulk upload past recordings or transcripts to instantly build a history for any client.',
  },
  {
    question: 'Is this different from Otter or Fireflies?',
    answer:
      'Yes. Those tools focus on transcription. Solis focuses on intelligence—connecting the dots between meetings to show you what you promised, who you met, and what to do next.',
  },
  {
    question: "So it's like ChatGPT?",
    answer:
      "Exactly—but with context. Solis is like a ChatGPT that has memorized every client conversation you've ever had, so you don't have to explain the back-story.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="container px-4 md:px-6 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4 text-slate-900">
          Frequently asked questions
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12">
          Everything you need to know about the product and waitlist.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white border text-left border-slate-200 px-6 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <AccordionTrigger className="text-lg font-medium hover:text-primary hover:no-underline py-4 text-slate-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-4 leading-relaxed max-w-2xl">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
