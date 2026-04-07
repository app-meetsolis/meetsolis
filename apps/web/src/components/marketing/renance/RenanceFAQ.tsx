'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'What makes Renance different from other finance tools?',
    a: "Most finance tools are passive—they show you data after the fact and leave interpretation to you. Renance is proactive. It monitors your finances continuously, flags issues before they become problems, and gives you clear, actionable recommendations instead of just charts. It's the difference between a dashboard and a co-pilot.",
  },
  {
    q: 'Who is Renance built for, founders, finance teams, or both?',
    a: 'Renance is designed for both. Founders get a clear financial picture without needing a background in finance. Finance teams get AI-powered depth—forecasting, risk monitoring, and decision simulation—that replaces hours of manual work. Both personas get the same outcome: faster, more confident decisions.',
  },
  {
    q: 'How does Renance handle forecasts?',
    a: 'Renance builds forecasts dynamically, using your actual transaction data, committed spend, revenue signals, and growth assumptions. Forecasts update automatically as conditions change—so you always have a current view of your runway, burn, and cash position, without rebuilding models.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Yes. Renance uses bank-grade encryption (AES-256 at rest, TLS in transit), SOC 2 Type II compliance, and follows strict data minimization principles. Your data is never used to train AI models or shared with third parties.',
  },
  {
    q: 'What tools and accounts can Renance integrate with?',
    a: 'Renance connects to your bank accounts, accounting platforms (QuickBooks, Xero, NetSuite), payroll systems, and billing tools via secure OAuth and API integrations. Most teams are fully set up within one business day.',
  },
];

export function RenanceFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '80px',
            alignItems: 'start',
          }}
        >
          {/* Left — heading */}
          <div>
            <h2
              className="rn-serif"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}
            >
              Ask away
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--rn-muted)',
                lineHeight: 1.65,
                maxWidth: '300px',
              }}
            >
              Everything you need to know about how Renance works, what makes it
              different, and how teams use it day to day.
            </p>
          </div>

          {/* Right — accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--rn-card)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: '12px',
                      fontFamily: 'var(--rn-sans)',
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--rn-fg)',
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: 'var(--rn-badge-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--rn-fg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {/* Answer */}
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 20px 18px',
                        fontSize: '14px',
                        color: 'var(--rn-muted)',
                        lineHeight: 1.7,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
