'use client';

import Link from 'next/link';

const navigate = ['Features', 'Pricing', 'Compare'];
const company = ['Changelog', 'Privacy policy', 'Terms of service'];
const social = ['X', 'LinkedIn', 'Youtube'];

export function RenanceFooter() {
  return (
    <footer
      style={{
        background: 'var(--rn-footer-bg)',
        borderRadius: '32px 32px 0 0',
        marginTop: '0',
        overflow: 'hidden',
      }}
    >
      <div className="rn-container" style={{ padding: '64px 40px 40px' }}>
        {/* Main content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '60px',
            alignItems: 'start',
            marginBottom: '64px',
          }}
        >
          {/* Left — tagline */}
          <div>
            <h2
              className="rn-serif"
              style={{
                fontSize: 'clamp(44px, 6vw, 80px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: 'white',
                margin: 0,
              }}
            >
              Rethink.
              <br />
              Refine.
              <br />
              Renance.
            </h2>
          </div>

          {/* Right — nav columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '48px',
              paddingTop: '8px',
            }}
          >
            {/* Navigate */}
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Navigate
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {navigate.map(item => (
                  <Link
                    key={item}
                    href="#"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.color = 'white')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(255,255,255,0.7)')
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Company
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {company.map(item => (
                  <Link
                    key={item}
                    href="#"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.color = 'white')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(255,255,255,0.7)')
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Social
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {social.map(item => (
                  <Link
                    key={item}
                    href="#"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.color = 'white')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(255,255,255,0.7)')
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'white',
                flexShrink: 0,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <circle cx="4" cy="4" r="2.5" fill="#0a0a0a" />
              </svg>
            </span>
            <span
              style={{
                fontFamily: 'var(--rn-serif)',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Renance
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              High-converting SaaS template for Framer.
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              © 2024 Renance Inc.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
