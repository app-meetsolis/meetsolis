import React from 'react';
import Link from 'next/link';

const productLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#core-value' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  return (
    <footer
      className="w-full p-3 md:p-6"
      style={{ backgroundColor: 'rgb(248,249,250)' }}
    >
      <div
        className="w-full relative overflow-hidden"
        style={{ backgroundColor: '#000000', borderRadius: '32px' }}
      >
        {/* Green glow effects */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(160px)',
            opacity: 0.35,
            bottom: '-180px',
            left: '-60px',
            zIndex: 0,
          }}
        />
        <div
          className="absolute"
          style={{
            width: '1200px',
            height: '180px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(160px)',
            opacity: 0.18,
            bottom: '-80px',
            left: '-200px',
            zIndex: 0,
          }}
        />

        {/* Green bottom bar */}
        <div
          className="absolute bottom-0"
          style={{
            left: 'calc(50% - 448px)',
            width: '896px',
            height: '2px',
            background: 'linear-gradient(90deg, #000, rgb(106,235,201), #000)',
            zIndex: 2,
          }}
        />

        {/* Main content */}
        <div
          className="relative px-6 pt-10 pb-8 sm:px-10 sm:pt-12 md:px-16 md:pt-16 md:pb-10"
          style={{ zIndex: 10 }}
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Left: Brand */}
            <div className="flex flex-col gap-6" style={{ maxWidth: '280px' }}>
              {/* Logo text */}
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgb(106,235,201)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{ fontSize: '16px', fontWeight: 800, color: '#000' }}
                  >
                    ✦
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  MeetSolis
                </span>
              </div>

              {/* Tagline */}
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: '1.6em',
                  letterSpacing: '-0.01em',
                }}
              >
                Never forget a client&apos;s breakthrough moment again.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/meetsolis"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    width="18"
                    height="18"
                    fill="rgba(255,255,255,0.7)"
                  >
                    <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="https://x.com/meetsolis"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    width="18"
                    height="18"
                    fill="rgba(255,255,255,0.7)"
                  >
                    <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Product + Legal grouped */}
            <div className="flex gap-16">
              {/* Product */}
              <div className="flex flex-col gap-5">
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.1em',
                  }}
                >
                  PRODUCT
                </h4>
                <div className="flex flex-col gap-3">
                  {productLinks.map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-5">
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.1em',
                  }}
                >
                  LEGAL
                </h4>
                <div className="flex flex-col gap-3">
                  {legalLinks.map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOLIS watermark + copyright row */}
        <div className="relative" style={{ zIndex: 5 }}>
          {/* Copyright overlaid top-right of the text */}
          <div
            style={{
              position: 'absolute',
              right: 'clamp(16px, 5vw, 64px)',
              top: '50%',
              transform: 'translateY(-80%)',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              © 2026 MeetSolis. All rights reserved.
            </p>
          </div>

          {/* Big SOLIS outline text */}
          <div
            style={{
              textAlign: 'center',
              lineHeight: '0.82',
              overflow: 'hidden',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(120px, 18vw, 240px)',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(106,235,201,0.18)',
                letterSpacing: '0.04em',
                display: 'block',
                fontFamily: 'Geist, Plus Jakarta Sans, sans-serif',
              }}
            >
              MEETSOLIS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
