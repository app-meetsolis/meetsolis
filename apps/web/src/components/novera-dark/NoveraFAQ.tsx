'use client';
import React, { useState, useRef, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is MeetSolis?',
    answer:
      'MeetSolis is an AI-powered client memory platform built for executive coaches. After each session, MeetSolis automatically generates a summary, action items, and key topics — then stores everything in a searchable memory you can query anytime.',
  },
  {
    question: 'How does it work?',
    answer:
      "Your transcript is automatically generated during your coaching session. MeetSolis then processes it with AI to extract key moments, commitments, and breakthroughs — no manual work needed. You can then use Solis Intelligence to ask questions about any client's history in plain English.",
  },
  {
    question: 'Which meeting platforms does it support?',
    answer:
      'Any platform. If your meeting tool exports a transcript or recording — Zoom, Google Meet, Microsoft Teams, Loom, or anything else — MeetSolis can process it. We are platform-agnostic by design.',
  },
  {
    question: "Is my clients' data private and secure?",
    answer:
      "Absolutely. Your clients' conversations are deeply personal, and we treat them that way. MeetSolis never uses your data to train AI models. All data is encrypted in transit and at rest, and each coach's data is completely isolated from other users.",
  },
  {
    question: 'What does the free plan include?',
    answer:
      'The free plan gives you 3 active clients, 5 lifetime sessions, and 75 AI queries — enough to experience the full value of MeetSolis before committing. No credit card required.',
  },
  {
    question: 'What is Solis Intelligence?',
    answer:
      'Solis is your AI coaching assistant. Ask it anything about any client — "What has Sarah been working on?" or "Which clients haven\'t met their goals?" — and it searches your entire session history to give you a cited, accurate answer in seconds.',
  },
];

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <line x1="12" y1="5" x2="12" y2="19" />
  </svg>
);

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  animStyle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  animStyle?: React.CSSProperties;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div style={animStyle}>
      <div
        className="w-full rounded-lg overflow-hidden cursor-pointer"
        style={{
          backgroundColor: '#f0ede6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'box-shadow 0.25s ease',
        }}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#0d1410',
              margin: 0,
            }}
          >
            {item.question}
          </p>
          <div
            className="flex-shrink-0 ml-4"
            style={{
              color: '#1a6b42',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <PlusIcon />
          </div>
        </div>

        <div
          ref={bodyRef}
          style={{
            maxHeight: isOpen
              ? `${bodyRef.current?.scrollHeight ?? 300}px`
              : '0px',
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            transition:
              'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
          }}
        >
          <div className="px-6 pb-5">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '1.6em',
                color: '#4a5a50',
                margin: 0,
              }}
            >
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NoveraFAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  return (
    <section id="faq" className="w-full" style={{ backgroundColor: '#0b1612' }}>
      <div ref={sectionRef} className="max-w-[1248px] mx-auto px-6 py-32">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex flex-col gap-6 max-w-[440px]" style={fadeUp(0)}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-2 rounded-full"
                  style={{ backgroundColor: '#1a6b42' }}
                />
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#b8c5bf',
                  }}
                >
                  Common questions
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Petrona, serif',
                  fontSize: 'clamp(32px, 3.5vw, 40px)',
                  fontWeight: 500,
                  letterSpacing: '-0.04em',
                  lineHeight: '1.1em',
                  color: '#d9f0e5',
                  margin: 0,
                }}
              >
                Everything you need to know about MeetSolis
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  color: '#b8c5bf',
                  margin: 0,
                }}
              >
                Still can&apos;t find what you&apos;re looking for?
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:opacity-90 w-fit"
              style={{
                backgroundColor: '#1a6b42',
                color: '#d9f0e5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Contact us
            </a>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {faqItems.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                animStyle={fadeUp(0.15 + index * 0.09)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
