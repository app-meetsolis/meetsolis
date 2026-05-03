'use client';
import React from 'react';

const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
    />
    <line
      x1="8.25"
      y1="10.5"
      x2="8.25"
      y2="16.5"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="11.25"
      y1="10.5"
      x2="11.25"
      y2="16.5"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M11.25 13.125C11.25 11.675 12.425 10.5 13.875 10.5C15.325 10.5 16.5 11.675 16.5 13.125V16.5"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="8.25" cy="7.875" r="1.125" fill="rgba(100,185,140,0.8)" />
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4.5 3.75L9 3.75L19.5 20.25L15 20.25Z"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 20.25L10.676 13.456"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13.324 3.75L19.5 10.544"
      stroke="rgba(100,185,140,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const footerLinks = {
  Product: [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#detailed-features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms & conditions', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
  ],
};

export default function NoveraFooter() {
  return (
    <footer
      className="w-full overflow-hidden"
      style={{ backgroundColor: '#050e08' }}
    >
      {/* Top content */}
      <div className="max-w-[1248px] mx-auto px-6 pt-16 pb-0">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand col */}
          <div className="flex flex-col gap-6 max-w-[280px]">
            <a
              href="#hero"
              className="flex items-center gap-2"
              style={{ textDecoration: 'none' }}
            >
              <img
                src="/images/meetsolis-logo.png"
                alt="MeetSolis logo"
                width={30}
                height={30}
                style={{
                  filter: 'invert(1) brightness(100)',
                  mixBlendMode: 'screen',
                  objectFit: 'contain',
                }}
              />
              <span
                style={{
                  fontFamily: 'Petrona, serif',
                  fontSize: '22px',
                  fontWeight: 500,
                  letterSpacing: '-0.04em',
                  color: '#d9f0e5',
                }}
              >
                MeetSolis
              </span>
            </a>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5em',
                color: 'rgba(184,197,191,0.8)',
                margin: 0,
              }}
            >
              Never forget a client&apos;s breakthrough moment again. The AI
              memory layer built for executive coaches.
            </p>
            <a
              href="mailto:hari@meetsolis.com"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: 'rgba(100,185,140,0.9)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d9f0e5')}
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'rgba(100,185,140,0.9)')
              }
            >
              hari@meetsolis.com
            </a>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/harigopal-suthar-6a3372307/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://x.com/SutharHarigopal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
            </div>
          </div>

          {/* Link cols */}
          <div className="flex gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-4">
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(100,185,140,0.7)',
                    margin: 0,
                  }}
                >
                  {category}
                </p>
                <div className="flex flex-col gap-3">
                  {links.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#c8e8d8',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.color = 'rgba(100,185,140,0.8)')
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.color = '#c8e8d8')
                      }
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex items-center justify-between mt-10 pb-4">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'rgba(184,197,191,0.4)',
              margin: 0,
            }}
          >
            © 2026 MeetSolis. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'rgba(184,197,191,0.4)',
              margin: 0,
            }}
          >
            Built for client-facing professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
