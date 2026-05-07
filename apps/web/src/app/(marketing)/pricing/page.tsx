'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width="16"
    height="16"
    fill="currentColor"
    style={{ flexShrink: 0, marginTop: '1px' }}
  >
    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z" />
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

  return (
    <>
      <style>{`
      .pricing-btn-outline {
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
      }
      .pricing-btn-outline:hover {
        background-color: #000000 !important;
        color: #ffffff !important;
        border-color: #000000 !important;
        transform: translateY(-2px);
        box-shadow: 0px 8px 24px rgba(0,0,0,0.18);
      }
      .pricing-btn-pro {
        transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }
      .pricing-btn-pro:hover {
        transform: translateY(-2px);
        box-shadow: 0px 10px 32px rgba(106,235,201,0.45);
        filter: brightness(1.08);
      }
    `}</style>
      <section
        className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16 md:py-20"
        style={{ backgroundColor: 'rgb(248,249,250)', minHeight: '100vh' }}
      >
        <div className="w-full max-w-[1100px] flex flex-col items-center gap-16">
          {/* Header */}
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="section-badge">PRICING</span>
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: 600,
                letterSpacing: 'clamp(-1px, -0.4vw, -3px)',
                lineHeight: '1.05em',
                color: '#000000',
              }}
            >
              Simple pricing for every
              <br />
              stage of your practice.
            </h1>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.55)',
                letterSpacing: '-0.02em',
                lineHeight: '1.5em',
              }}
            >
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>

            {/* Billing toggle */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '100px',
                padding: '5px',
                border: '1px solid rgb(233,235,239)',
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
                  backgroundColor: !isAnnual ? '#000000' : 'transparent',
                  color: !isAnnual ? '#ffffff' : 'rgba(0,0,0,0.45)',
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
                  backgroundColor: isAnnual ? '#000000' : 'transparent',
                  color: isAnnual ? '#ffffff' : 'rgba(0,0,0,0.45)',
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
                    color: isAnnual ? 'rgb(106,235,201)' : 'rgba(0,0,0,0.35)',
                    backgroundColor: isAnnual
                      ? 'rgba(106,235,201,0.15)'
                      : 'rgba(0,0,0,0.06)',
                    borderRadius: '6px',
                    padding: '2px 7px',
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s',
                  }}
                >
                  Save $240
                </span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Free */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgb(233,235,239)',
                borderRadius: '24px',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                boxShadow:
                  '0px 4px 32px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex flex-col gap-4">
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.35)',
                    letterSpacing: '0.12em',
                  }}
                >
                  FREE
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '52px',
                      fontWeight: 700,
                      color: '#000000',
                      letterSpacing: '-3px',
                      lineHeight: '1em',
                    }}
                  >
                    $0
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'rgba(0,0,0,0.35)',
                    }}
                  >
                    / forever
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.55)',
                    lineHeight: '1.5em',
                  }}
                >
                  Try MeetSolis with your first clients. No card needed.
                </p>
              </div>

              <Link
                href="/sign-up"
                className="pricing-btn-outline"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid rgb(220,222,228)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#000000',
                  textDecoration: 'none',
                }}
              >
                Start Free
              </Link>

              <div
                style={{ height: '1px', backgroundColor: 'rgb(240,241,244)' }}
              />

              <div className="flex flex-col gap-3">
                {freeFeatures.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      color: 'rgb(22,167,129)',
                    }}
                  >
                    <CheckIcon />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.65)',
                        lineHeight: '1.4em',
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro — gradient border wrapper */}
            <div
              style={{
                background:
                  'linear-gradient(160deg, rgb(106,235,201) 0%, rgb(22,167,129) 40%, rgb(11,80,50) 100%)',
                borderRadius: '26px',
                padding: '2px',
                position: 'relative',
                boxShadow:
                  '0px 8px 48px rgba(106,235,201,0.25), 0px 2px 16px rgba(0,0,0,0.3)',
              }}
            >
              {/* MOST POPULAR badge — straddling the top border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  background:
                    'linear-gradient(135deg, rgb(106,235,201), rgb(22,167,129))',
                  borderRadius: '100px',
                  padding: '7px 18px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#000000',
                    letterSpacing: '0.1em',
                  }}
                >
                  MOST POPULAR
                </span>
              </div>

              {/* Inner dark card */}
              <div
                style={{
                  background:
                    'linear-gradient(150deg, #000000 0%, #061a10 100%)',
                  borderRadius: '24px',
                  padding: '36px',
                  paddingTop: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow */}
                <div
                  style={{
                    position: 'absolute',
                    width: '350px',
                    height: '350px',
                    borderRadius: '100%',
                    backgroundColor: 'rgb(106,235,201)',
                    filter: 'blur(120px)',
                    opacity: 0.22,
                    bottom: '-120px',
                    left: '-60px',
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '100%',
                    backgroundColor: 'rgb(106,235,201)',
                    filter: 'blur(100px)',
                    opacity: 0.1,
                    top: '-60px',
                    right: '-40px',
                    zIndex: 0,
                  }}
                />

                <div
                  className="flex flex-col gap-4"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.12em',
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
                          fontSize: '52px',
                          fontWeight: 700,
                          color: '#ffffff',
                          letterSpacing: '-3px',
                          lineHeight: '1em',
                        }}
                      >
                        {isAnnual ? '$79' : '$99'}
                      </span>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.35)',
                        }}
                      >
                        / mo
                      </span>
                    </div>
                    {isAnnual && (
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.35)',
                          marginTop: '6px',
                        }}
                      >
                        $948 billed annually
                      </p>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.55)',
                      lineHeight: '1.5em',
                    }}
                  >
                    For coaches with a full roster. Every client, every session
                    — remembered.
                  </p>
                </div>

                <Link
                  href="/sign-up"
                  className="pricing-btn-pro"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '13px 20px',
                    borderRadius: '12px',
                    background:
                      'linear-gradient(135deg, rgb(106,235,201) 0%, rgb(22,167,129) 100%)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000000',
                    textDecoration: 'none',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Start 7-Day Free Trial
                </Link>

                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />

                <div
                  className="flex flex-col gap-3"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.06em',
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
                        color: 'rgb(106,235,201)',
                      }}
                    >
                      <CheckIcon />
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: '1.4em',
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
                backgroundColor: '#ffffff',
                border: '1px solid rgb(233,235,239)',
                borderRadius: '24px',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                boxShadow:
                  '0px 4px 32px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex flex-col gap-4">
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.35)',
                    letterSpacing: '0.12em',
                  }}
                >
                  TEAMS
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '52px',
                      fontWeight: 700,
                      color: '#000000',
                      letterSpacing: '-3px',
                      lineHeight: '1em',
                    }}
                  >
                    Custom
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.55)',
                    lineHeight: '1.5em',
                  }}
                >
                  For coaching firms and multi-coach practices.
                </p>
              </div>

              <a
                href="mailto:hari@meetsolis.com"
                className="pricing-btn-outline"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid rgb(220,222,228)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#000000',
                  textDecoration: 'none',
                }}
              >
                Contact Us
              </a>

              <div
                style={{ height: '1px', backgroundColor: 'rgb(240,241,244)' }}
              />

              <div className="flex flex-col gap-3">
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.3)',
                    letterSpacing: '0.06em',
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
                      color: 'rgb(22,167,129)',
                    }}
                  >
                    <CheckIcon />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.65)',
                        lineHeight: '1.4em',
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3 trust cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cancel anytime */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgb(233,235,239)',
                borderRadius: '20px',
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                boxShadow: '0px 2px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgb(240,253,249)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="20"
                  height="20"
                  fill="rgb(22,167,129)"
                >
                  <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-98.34-61.66a8,8,0,0,1,11.32-11.32L128,141.37l13-13a8,8,0,0,1,11.31,11.32l-13,13,13,13A8,8,0,0,1,141,176.63l-13-13-13,13a8,8,0,0,1-11.32-11.32l13-13Z" />
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  Cancel Anytime
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.5)',
                    lineHeight: '1.5em',
                  }}
                >
                  No lock-in. Cancel or downgrade in seconds from your account
                  settings.
                </p>
              </div>
            </div>

            {/* Secure payment */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgb(233,235,239)',
                borderRadius: '20px',
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                boxShadow: '0px 2px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgb(240,253,249)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="20"
                  height="20"
                  fill="rgb(22,167,129)"
                >
                  <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,16V88H48V56Zm0,144H48V104H208v96Zm-96-56a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H120A8,8,0,0,1,112,144Zm0,32a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H120A8,8,0,0,1,112,176ZM72,144a12,12,0,1,1,12,12A12,12,0,0,1,72,144Zm0,32a12,12,0,1,1,12,12A12,12,0,0,1,72,176Z" />
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  Secure Payments
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.5)',
                    lineHeight: '1.5em',
                  }}
                >
                  All payments are 256-bit encrypted and processed securely via
                  Dodo Payments.
                </p>
              </div>
            </div>

            {/* Questions */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgb(233,235,239)',
                borderRadius: '20px',
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                boxShadow: '0px 2px 16px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgb(240,253,249)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="20"
                  height="20"
                  fill="rgb(22,167,129)"
                >
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.19V181.81ZM32,68.16l96.2,88.32a8,8,0,0,0,10.82,0L224,68.16V192H32Z" />
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  Got Questions?
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.5)',
                    lineHeight: '1.5em',
                  }}
                >
                  Reach us at{' '}
                  <a
                    href="mailto:hari@meetsolis.com"
                    style={{
                      color: '#000000',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    hari@meetsolis.com
                  </a>{' '}
                  — we reply within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(0,0,0,0.35)',
              textAlign: 'center',
              maxWidth: '480px',
            }}
          >
            All plans include 256-bit encryption and private-by-design AI — your
            clients&apos; data never trains any model.
          </p>
        </div>
      </section>
    </>
  );
}
