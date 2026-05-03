'use client';
import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is an AI Agent?',
    answer:
      'An AI Agent is a task-specific assistant that automates workflows like scheduling, content creation, data processing, and more—without requiring any code.',
  },
  {
    question: 'Do I need technical skills to use an agent?',
    answer:
      'No technical skills are required. Our platform is designed to be used by anyone on your team, regardless of technical background.',
  },
  {
    question: 'Can I use multiple agents at the same time?',
    answer:
      'Yes! You can deploy and manage multiple AI agents in parallel to handle complex, multi-step operations simultaneously.',
  },
  {
    question: 'How customizable are the agents?',
    answer:
      'Agents are highly customizable. You can configure them to match your specific business workflows, integrate with your tools, and set custom triggers and actions.',
  },
  {
    question: 'What tools do the agents integrate with?',
    answer:
      'Our agents integrate with a wide range of tools including Slack, Notion, Google Workspace, Salesforce, HubSpot, and many more. New integrations are added regularly.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16"
      id="faq"
      style={{ backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[700px] flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">FAQ</span>
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 600,
                letterSpacing: 'clamp(-1px, -0.4vw, -3px)',
                lineHeight: '1em',
                color: '#000000',
                textAlign: 'center',
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#000000',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Do you want to learn more about us, let&apos;s go the blog page.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-3">
          {faqs?.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              style={{
                backgroundColor:
                  openIndex === i ? '#ffffff' : 'rgb(248,249,250)',
                border: '1px solid rgb(228,228,228)',
                borderRadius: '20px',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '48px',
                }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.5em',
                    flex: 1,
                  }}
                >
                  {faq?.question}
                </p>
                <div
                  style={{
                    transform: openIndex === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    width="24"
                    height="24"
                    fill="#000000"
                  >
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                  </svg>
                </div>
              </div>
              {openIndex === i && (
                <div style={{ padding: '0 24px 24px' }}>
                  <p
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: 'rgb(78,91,109)',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.5em',
                    }}
                  >
                    {faq?.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Center Button */}
        <div className="flex justify-center">
          <a href="#" className="btn-dark" style={{ padding: '14px 20px' }}>
            Help Center
          </a>
        </div>
      </div>
    </section>
  );
}
