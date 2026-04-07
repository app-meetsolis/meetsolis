'use client';

import { useState } from 'react';
import Link from 'next/link';

export function RenanceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--rn-bg)',
        borderBottom: '1px solid var(--rn-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="rn-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        {/* Logo */}
        <Link
          href="/renance"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'var(--rn-fg)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--rn-fg)',
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3" fill="white" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: 'var(--rn-serif)',
              fontSize: '16px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Renance
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="hidden md:flex"
        >
          {['Features', 'Pricing', 'Compare', 'Blog'].map(item => (
            <Link
              key={item}
              href="#"
              style={{
                fontSize: '14px',
                color: 'var(--rn-muted)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e =>
                ((e.target as HTMLElement).style.color = 'var(--rn-fg)')
              }
              onMouseLeave={e =>
                ((e.target as HTMLElement).style.color = 'var(--rn-muted)')
              }
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="#"
            className="hidden md:inline-flex"
            style={{
              padding: '8px 18px',
              background: 'var(--rn-badge-bg)',
              color: 'var(--rn-fg)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--rn-border)',
              transition: 'background 0.2s',
            }}
          >
            Schedule a call
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--rn-fg)',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: 'var(--rn-bg)',
            borderTop: '1px solid var(--rn-border)',
            padding: '20px',
          }}
          className="md:hidden"
        >
          <nav
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {['Features', 'Pricing', 'Compare', 'Blog'].map(item => (
              <Link
                key={item}
                href="#"
                style={{
                  fontSize: '16px',
                  color: 'var(--rn-fg)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {item}
              </Link>
            ))}
            <a
              href="#"
              style={{
                padding: '12px 18px',
                background: 'var(--rn-badge-bg)',
                color: 'var(--rn-fg)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              Schedule a call
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
