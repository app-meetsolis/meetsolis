'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

interface Plan {
  name: string;
  monthly: string;
  yearly: string;
  note: string;
  desc: string;
  cta: string;
  badge?: string;
  featured?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    monthly: '$0',
    yearly: '$0',
    note: '/month',
    desc: 'For coaches just getting started. No credit card required.',
    cta: 'Start for Free',
    features: [
      '3 active clients',
      '5 lifetime transcripts',
      '75 AI queries lifetime',
    ],
  },
  {
    name: 'Pro',
    monthly: '$99',
    yearly: '$79',
    note: '/month',
    desc: "Everything you need to never forget a client's breakthrough moment.",
    cta: '',
    badge: 'Most Popular',
    featured: true,
    features: [
      'Unlimited clients',
      'Unlimited transcripts',
      'Unlimited AI queries',
      'Solis Intelligence (AI memory)',
      'Pre-session briefs',
      'Action item tracking',
      'Session timeline',
      'Custom AI summary templates',
      'Export client reports (PDF)',
      'Priority support',
    ],
  },
];

const CheckIcon = ({ color = '#b8c5bf' }: { color?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const reveal = (v: boolean, d: number, y = 36): React.CSSProperties => ({
  opacity: v ? 1 : 0,
  transform: v ? 'translateY(0) scale(1)' : `translateY(${y}px) scale(0.97)`,
  filter: v ? 'blur(0px)' : 'blur(6px)',
  transition: 'opacity 0.7s ease, transform 0.7s ease, filter 0.7s ease',
  transitionDelay: `${d}s`,
});

export default function NoveraPricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [visible, setVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();

  const handleProCTA = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }
    setCheckoutLoading(true);
    try {
      const plan = billing === 'yearly' ? 'annual' : 'monthly';
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(
          'Could not start checkout. Please try again or contact hari@meetsolis.com.'
        );
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('[checkout] error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

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

  return (
    <section
      id="pricing"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <div ref={sectionRef} className="max-w-[1248px] mx-auto px-6 py-32">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex items-center gap-2" style={reveal(visible, 0)}>
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
              Pricing
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Petrona, serif',
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: '1.1em',
              color: '#d9f0e5',
              margin: 0,
              textAlign: 'center',
              ...reveal(visible, 0.1),
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: '#b8c5bf',
              margin: 0,
              textAlign: 'center',
              ...reveal(visible, 0.2),
            }}
          >
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Billing toggle */}
        <div
          className="flex items-center justify-center gap-3 mb-10"
          style={reveal(visible, 0.3, 20)}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: billing === 'monthly' ? '#d9f0e5' : '#b8c5bf',
            }}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling(b => (b === 'monthly' ? 'yearly' : 'monthly'))
            }
            className="relative rounded-full"
            style={{
              width: '48px',
              height: '24px',
              backgroundColor: '#0b1612',
              border: '1px solid rgba(26,107,66,0.3)',
            }}
            aria-label="Toggle billing period"
          >
            <div
              className="absolute top-1/2 rounded-full transition-all duration-200"
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#4db87a',
                transform: `translateY(-50%) translateX(${billing === 'yearly' ? '28px' : '4px'})`,
              }}
            />
          </button>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: billing === 'yearly' ? '#d9f0e5' : '#b8c5bf',
            }}
          >
            Yearly
          </span>
          <span
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: '#132a1e',
              color: '#4db87a',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            20% OFF
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[840px] mx-auto mb-6">
          {PLANS.map((p, i) => {
            const bg = p.featured ? '#f0ede6' : '#0f1c14';
            const border = p.featured
              ? 'none'
              : '1px solid rgba(217,240,229,0.14)';
            const clr = p.featured ? '#0d1410' : '#d9f0e5';
            const muted = p.featured ? '#4a5a50' : '#8a9e95';
            const divider = p.featured
              ? 'rgba(10,30,20,0.12)'
              : 'rgba(217,240,229,0.08)';
            const check = p.featured ? '#1a6b42' : '#4db87a';
            return (
              <div
                key={p.name}
                className="flex flex-col gap-6 p-7 rounded-xl"
                style={{
                  backgroundColor: bg,
                  border,
                  ...reveal(visible, 0.4 + i * 0.15),
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: clr,
                    }}
                  >
                    {p.name}
                  </span>
                  {p.badge && (
                    <span
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: '#1a4d2e',
                        color: '#a3e4be',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-end gap-1">
                    <span
                      style={{
                        fontFamily: 'Petrona, serif',
                        fontSize: '48px',
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        lineHeight: '1em',
                        color: clr,
                      }}
                    >
                      {billing === 'monthly' ? p.monthly : p.yearly}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: muted,
                        paddingBottom: '6px',
                      }}
                    >
                      {p.note}
                    </span>
                  </div>
                  {billing === 'yearly' && p.featured && (
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: muted,
                      }}
                    >
                      $948 billed annually · Save $240
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.55em',
                    color: muted,
                    margin: 0,
                    minHeight: '44px',
                  }}
                >
                  {p.desc}
                </p>
                {p.featured ? (
                  <button
                    onClick={handleProCTA}
                    disabled={checkoutLoading}
                    className="w-full flex items-center justify-center py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#1a4d2e',
                      color: '#f0ede6',
                      border: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                    }}
                  >
                    {checkoutLoading
                      ? 'Redirecting…'
                      : isSignedIn
                        ? 'Upgrade to Pro'
                        : 'Get Started'}
                  </button>
                ) : (
                  <a
                    href="/sign-up"
                    className="w-full flex items-center justify-center py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#d9f0e5',
                      border: '1px solid rgba(45,158,95,0.35)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    {p.cta}
                  </a>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: divider }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: muted,
                    }}
                  >
                    Features
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: divider }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  {p.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckIcon color={check} />
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: muted,
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-lg"
          style={{
            backgroundColor: '#0f1c14',
            border: '1px solid rgba(217,240,229,0.08)',
            ...reveal(visible, 0.75, 24),
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#d9f0e5',
              margin: 0,
            }}
          >
            Need help choosing?{' '}
            <span style={{ color: '#b8c5bf', fontWeight: 400 }}>
              Talk to our team.
            </span>
          </p>
          <a
            href="/contact"
            className="px-5 py-2.5 rounded-md"
            style={{
              backgroundColor: '#1a6b42',
              color: '#d9f0e5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition:
                'transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.08)';
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(26,107,66,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'scale(0.97)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
}
