'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const BG = '#0b1612';
const CARD = 'rgba(217,240,229,0.05)';
const BORDER = 'rgba(217,240,229,0.1)';
const TEXT = '#d9f0e5';
const MUTED = 'rgba(217,240,229,0.5)';
const GREEN = '#4ade80';
const GREEN_DIM = 'rgba(74,222,128,0.15)';

const CheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={GREEN}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: '2px' }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const freeFeatures = [
  '3 client cards',
  '5 transcript uploads (lifetime)',
  '75 Solis Intelligence queries',
  'AI session summaries & action items',
  'Session timeline view',
  'Speaker-aware transcripts',
];

const proFeatures = [
  'Unlimited client cards',
  '25 transcript uploads / month',
  '2,000 Solis Intelligence queries / month',
  'Audio & video upload (auto-transcribed)',
  'Full session history, no limits',
  'Priority AI processing',
  'Email support',
];

const teamsFeatures = [
  'Multiple coach seats',
  'Team admin dashboard',
  'Unlimited transcripts & queries',
  'GDPR Data Processing Agreement',
  'Custom data retention policies',
  'Dedicated account support',
  'SSO / SAML login',
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { isSignedIn } = useAuth();

  const handleProCTA = () => {
    if (isSignedIn) {
      window.location.href = '/api/billing/checkout?plan=monthly';
    } else {
      window.location.href = '/sign-up';
    }
  };

  return (
    <section
      style={{
        backgroundColor: BG,
        minHeight: '100vh',
        padding: '80px 16px 120px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '64px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: GREEN,
              textTransform: 'uppercase',
              backgroundColor: GREEN_DIM,
              padding: '5px 14px',
              borderRadius: '100px',
            }}
          >
            PRICING
          </span>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: '1.05',
              color: TEXT,
              margin: 0,
            }}
          >
            Simple pricing for every
            <br />
            stage of your practice.
          </h1>
          <p
            style={{
              fontSize: '17px',
              fontWeight: 400,
              color: MUTED,
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(217,240,229,0.06)',
              borderRadius: '100px',
              padding: '4px',
              border: `1px solid ${BORDER}`,
              marginTop: '8px',
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: '8px 22px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: !isAnnual
                  ? 'rgba(217,240,229,0.12)'
                  : 'transparent',
                color: !isAnnual ? TEXT : MUTED,
                transition: 'all 0.2s',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: '8px 22px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isAnnual
                  ? 'rgba(217,240,229,0.12)'
                  : 'transparent',
                color: isAnnual ? TEXT : MUTED,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Annual
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: GREEN,
                  backgroundColor: GREEN_DIM,
                  borderRadius: '6px',
                  padding: '2px 7px',
                }}
              >
                Save $240
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >
          {/* Free */}
          <div
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '20px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: '0.12em',
                  margin: 0,
                }}
              >
                FREE
              </p>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}
              >
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: TEXT,
                    letterSpacing: '-3px',
                    lineHeight: 1,
                  }}
                >
                  $0
                </span>
                <span style={{ fontSize: '14px', color: MUTED }}>/forever</span>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: MUTED,
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                Try MeetSolis with your first clients. No card needed.
              </p>
            </div>

            <Link
              href="/sign-up"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px 20px',
                borderRadius: '10px',
                border: `1.5px solid ${BORDER}`,
                fontSize: '14px',
                fontWeight: 600,
                color: TEXT,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Start Free
            </Link>

            <div style={{ height: '1px', backgroundColor: BORDER }} />

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {freeFeatures.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <CheckIcon />
                  <span
                    style={{
                      fontSize: '13px',
                      color: MUTED,
                      lineHeight: '1.4',
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div
            style={{
              background:
                'linear-gradient(160deg, rgba(74,222,128,0.6) 0%, rgba(22,167,80,0.4) 40%, rgba(11,80,30,0.3) 100%)',
              borderRadius: '22px',
              padding: '2px',
              position: 'relative',
              boxShadow: '0 8px 48px rgba(74,222,128,0.15)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                background: 'linear-gradient(135deg, #4ade80, #16a74f)',
                borderRadius: '100px',
                padding: '6px 16px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#000',
                  letterSpacing: '0.08em',
                }}
              >
                MOST POPULAR
              </span>
            </div>
            <div
              style={{
                backgroundColor: '#0d1f15',
                borderRadius: '20px',
                padding: '32px',
                paddingTop: '44px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '100%',
                  backgroundColor: '#4ade80',
                  filter: 'blur(100px)',
                  opacity: 0.08,
                  bottom: '-80px',
                  left: '-40px',
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(217,240,229,0.35)',
                    letterSpacing: '0.12em',
                    margin: 0,
                  }}
                >
                  PRO
                </p>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '48px',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-3px',
                        lineHeight: 1,
                      }}
                    >
                      {isAnnual ? '$79' : '$99'}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: 'rgba(217,240,229,0.4)',
                      }}
                    >
                      /mo
                    </span>
                  </div>
                  {isAnnual && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'rgba(217,240,229,0.4)',
                        marginTop: '4px',
                      }}
                    >
                      $948 billed annually
                    </p>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(217,240,229,0.6)',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  For coaches with a full roster. Every client, every session —
                  remembered.
                </p>
              </div>

              <button
                onClick={handleProCTA}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background:
                    'linear-gradient(135deg, #4ade80 0%, #16a74f 100%)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.2s',
                }}
              >
                {isSignedIn ? 'Upgrade to Pro — $99/month' : 'Start Free Trial'}
              </button>

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(217,240,229,0.08)',
                  position: 'relative',
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(217,240,229,0.3)',
                    letterSpacing: '0.06em',
                    margin: 0,
                  }}
                >
                  EVERYTHING IN FREE, PLUS:
                </p>
                {proFeatures.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    <CheckIcon />
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'rgba(217,240,229,0.7)',
                        lineHeight: '1.4',
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teams */}
          <div
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '20px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: '0.12em',
                  margin: 0,
                }}
              >
                TEAMS
              </p>
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: '-3px',
                  lineHeight: 1,
                }}
              >
                Custom
              </span>
              <p
                style={{
                  fontSize: '14px',
                  color: MUTED,
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                For coaching firms and multi-coach practices.
              </p>
            </div>

            <a
              href="mailto:hari@meetsolis.com"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px 20px',
                borderRadius: '10px',
                border: `1.5px solid ${BORDER}`,
                fontSize: '14px',
                fontWeight: 600,
                color: TEXT,
                textDecoration: 'none',
              }}
            >
              Contact Us
            </a>

            <div style={{ height: '1px', backgroundColor: BORDER }} />

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: MUTED,
                  letterSpacing: '0.06em',
                  margin: 0,
                }}
              >
                EVERYTHING IN PRO, PLUS:
              </p>
              {teamsFeatures.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <CheckIcon />
                  <span
                    style={{
                      fontSize: '13px',
                      color: MUTED,
                      lineHeight: '1.4',
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {[
            {
              title: 'Cancel Anytime',
              body: 'No lock-in. Cancel or downgrade in seconds from your account settings.',
            },
            {
              title: 'Secure Payments',
              body: 'All payments are 256-bit encrypted and processed securely via Dodo Payments.',
            },
            {
              title: 'Got Questions?',
              body: 'Reach us at hari@meetsolis.com — we reply within 24 hours.',
            },
          ].map((t, i) => (
            <div
              key={i}
              style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: '16px',
                padding: '24px 28px',
              }}
            >
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: TEXT,
                  margin: '0 0 6px',
                }}
              >
                {t.title}
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  color: MUTED,
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                {t.body}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: '13px',
            color: MUTED,
            textAlign: 'center',
            maxWidth: '480px',
            margin: 0,
          }}
        >
          All plans include 256-bit encryption and private-by-design AI — your
          clients&apos; data never trains any model.
        </p>
      </div>
    </section>
  );
}
