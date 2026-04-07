'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 12,
    annualPrice: 8,
    subtitle: 'Best for individuals & early teams',
    features: [
      'AI-powered financial overview',
      'Basic cash flow tracking',
      'Core spend categorization',
      'Decision history (limited)',
      'Secure cloud sync',
    ],
    cta: 'Get started',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 35,
    annualPrice: 23,
    subtitle: 'Built for growing teams',
    features: [
      'AI Financial Copilot',
      'Smart cash flow forecasting',
      'Spend intelligence & insights',
      'Scenario simulations (hire, spend, growth)',
      'Secure cloud sync',
    ],
    cta: 'Get started',
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    monthlyPrice: 65,
    annualPrice: 44,
    subtitle: 'For advanced teams & finance leaders',
    features: [
      'Advanced risk monitoring',
      'Growth readiness checks',
      'Custom AI decision workflows',
      'Audit trails & permissions',
      'Unlimited integrations',
    ],
    cta: 'Get started',
    popular: false,
  },
];

export function RenancePricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" style={{ padding: '80px 0' }}>
      <div className="rn-container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            className="rn-badge"
            style={{ marginBottom: '16px', display: 'inline-flex' }}
          >
            Plans that scale with you
          </div>
          <h2
            className="rn-serif"
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}
          >
            Pricing for smarter financial decisions.
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--rn-muted)',
              maxWidth: '420px',
              margin: '0 auto 28px',
              lineHeight: 1.65,
            }}
          >
            Start with the essentials and unlock deeper AI-driven insight as
            your team and financial complexity grow.
          </p>

          {/* Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--rn-card)',
              borderRadius: '999px',
              padding: '4px',
              gap: '4px',
              position: 'relative',
            }}
          >
            {['Monthly', 'Annual'].map(period => {
              const active = (period === 'Annual') === isAnnual;
              return (
                <button
                  key={period}
                  onClick={() => setIsAnnual(period === 'Annual')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'var(--rn-sans)',
                    background: active ? 'var(--rn-fg)' : 'transparent',
                    color: active ? 'white' : 'var(--rn-muted)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {period}
                  {period === 'Annual' && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-4px',
                        background: '#f9a8d4',
                        color: '#9d174d',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}
                    >
                      -33%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            alignItems: 'stretch',
          }}
        >
          {plans.map(plan => (
            <div
              key={plan.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: plan.popular
                  ? '2px solid var(--rn-fg)'
                  : '2px solid transparent',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              {/* Price header */}
              <div
                style={{
                  background: 'var(--rn-card)',
                  padding: '24px',
                  flex: '0 0 auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--rn-fg)',
                    }}
                  >
                    {plan.name}
                  </span>
                  {plan.popular && (
                    <span
                      style={{
                        padding: '3px 10px',
                        background: 'var(--rn-badge-bg)',
                        border: '1px solid var(--rn-border)',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--rn-fg)',
                      }}
                    >
                      Popular
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '2px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    className="rn-serif"
                    style={{
                      fontSize: '48px',
                      lineHeight: 1,
                      color: 'var(--rn-fg)',
                    }}
                  >
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--rn-muted)',
                      fontWeight: 400,
                    }}
                  >
                    /mo
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--rn-muted)',
                    margin: 0,
                  }}
                >
                  {plan.subtitle}
                </p>
              </div>

              {/* Features */}
              <div
                style={{
                  background: 'var(--rn-card)',
                  padding: '0 24px 24px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  borderTop: '1px solid var(--rn-border)',
                  marginTop: '1px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    paddingTop: '20px',
                    flex: 1,
                  }}
                >
                  {plan.features.map(feat => (
                    <div
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{ color: 'var(--rn-green)', flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: '13.5px',
                          color: 'var(--rn-fg)',
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  style={{
                    marginTop: '24px',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: 'var(--rn-sans)',
                    background: plan.popular
                      ? 'var(--rn-fg)'
                      : 'var(--rn-btn-secondary)',
                    color: plan.popular ? 'white' : 'var(--rn-fg)',
                    transition: 'opacity 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.opacity = '0.85')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.opacity = '1')
                  }
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
