'use client';
import NoveraNavbar from '@/components/novera-dark/NoveraNavbar';
import NoveraFooter from '@/components/novera-dark/NoveraFooter';

export default function ContactPage() {
  return (
    <main
      style={{
        backgroundColor: '#0b1612',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NoveraNavbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className="max-w-[1248px] mx-auto w-full px-6 py-32">
          {/* Header */}
          <div className="flex flex-col gap-4 max-w-[540px] mb-16">
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
                Get in touch
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'Petrona, serif',
                fontSize: 'clamp(36px, 4vw, 52px)',
                fontWeight: 500,
                letterSpacing: '-0.04em',
                lineHeight: '1.1em',
                color: '#d9f0e5',
                margin: 0,
              }}
            >
              We&apos;d love to hear from you.
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '1.6em',
                color: '#b8c5bf',
                margin: 0,
              }}
            >
              Have a question, feedback, or need help with your account? Drop us
              an email — we typically respond within one business day.
            </p>
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[780px]">
            {/* Email card */}
            <div
              className="rounded-2xl p-8 flex flex-col gap-5"
              style={{
                backgroundColor: 'rgba(26,107,66,0.08)',
                border: '1px solid rgba(26,107,66,0.2)',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(26,107,66,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64b98c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <p
                  style={{
                    fontFamily: 'Petrona, serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#d9f0e5',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Email us
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#b8c5bf',
                    lineHeight: '1.5em',
                    margin: 0,
                  }}
                >
                  For questions, billing, and account support. We respond within
                  24 business hours.
                </p>
              </div>

              <a
                href="mailto:hari@meetsolis.com"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#64b98c',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d9f0e5')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64b98c')}
              >
                hari@meetsolis.com
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>

            {/* Response time card */}
            <div
              className="rounded-2xl p-8 flex flex-col gap-5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b8c5bf"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <p
                  style={{
                    fontFamily: 'Petrona, serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#d9f0e5',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Response time
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#b8c5bf',
                    lineHeight: '1.5em',
                    margin: 0,
                  }}
                >
                  We aim to reply within one business day. For urgent issues,
                  mention it in your subject line.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1a6b42',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#b8c5bf',
                    }}
                  >
                    Mon – Fri, 10 AM – 6 PM IST
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#1a6b42',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#b8c5bf',
                    }}
                  >
                    Billing inquiries prioritised
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'rgba(184,197,191,0.4)',
              marginTop: '32px',
            }}
          >
            Looking for our{' '}
            <a
              href="/refund"
              style={{ color: 'rgba(100,185,140,0.6)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#64b98c')}
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'rgba(100,185,140,0.6)')
              }
            >
              refund policy
            </a>{' '}
            or{' '}
            <a
              href="/privacy"
              style={{ color: 'rgba(100,185,140,0.6)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#64b98c')}
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'rgba(100,185,140,0.6)')
              }
            >
              privacy policy
            </a>
            ?
          </p>
        </div>
      </div>

      <NoveraFooter />
    </main>
  );
}
