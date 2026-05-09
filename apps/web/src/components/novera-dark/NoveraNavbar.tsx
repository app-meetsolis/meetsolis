'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function NoveraNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(8,16,11,0.55)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(217,240,229,0.07)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-[1248px] mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2"
          style={{ textDecoration: 'none' }}
        >
          <img
            src="/images/meetsolis-logo.png"
            alt="MeetSolis logo"
            width={32}
            height={32}
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

        <div className="hidden md:flex items-center gap-4">
          {[
            ['Features', 'detailed-features'],
            ['Pricing', 'pricing'],
            ['FAQ', 'faq'],
          ].map(([label, anchor]) => (
            <a
              key={label}
              href={`/#${anchor}`}
              className="text-sm font-medium transition-colors duration-300"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(195, 205, 200, 0.85)',
                fontSize: '16px',
                fontWeight: 400,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d9f0e5')}
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'rgba(195, 205, 200, 0.85)')
              }
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1">
          {!isLoaded ? null : isSignedIn ? (
            <a
              href="/clients"
              className="px-4 py-2 text-sm rounded-md transition-all duration-200"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#d9f0e5',
                backgroundColor: '#1a6b42',
                textDecoration: 'none',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.filter = 'brightness(1.08)')
              }
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              onMouseDown={e =>
                (e.currentTarget.style.transform = 'scale(0.97)')
              }
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Go to Dashboard
            </a>
          ) : (
            <>
              <a
                href="/sign-in"
                className="px-4 py-2 text-sm rounded-md transition-all duration-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'rgba(217,240,229,0.65)',
                  backgroundColor: 'transparent',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d9f0e5')}
                onMouseLeave={e =>
                  (e.currentTarget.style.color = 'rgba(217,240,229,0.65)')
                }
              >
                Login
              </a>
              <a
                href="/sign-up"
                className="px-4 py-2 text-sm rounded-md transition-all duration-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#d9f0e5',
                  backgroundColor: '#1a6b42',
                  textDecoration: 'none',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.filter = 'brightness(1.08)')
                }
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                onMouseDown={e =>
                  (e.currentTarget.style.transform = 'scale(0.97)')
                }
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Get Started
              </a>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6"
          style={{
            backgroundColor: 'rgba(8,16,11,0.65)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          }}
        >
          {[
            ['Features', 'detailed-features'],
            ['Pricing', 'pricing'],
            ['FAQ', 'faq'],
          ].map(([label, anchor]) => (
            <a
              key={label}
              href={`/#${anchor}`}
              className="block py-3 text-base border-b"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(195, 205, 200, 0.85)',
                borderColor: 'rgba(217,240,229,0.08)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex gap-3 mt-4">
            {!isLoaded ? null : isSignedIn ? (
              <a
                href="/clients"
                className="flex-1 text-center py-2 rounded-md text-sm font-medium"
                style={{
                  color: '#d9f0e5',
                  backgroundColor: '#1a6b42',
                  fontFamily: 'Inter, sans-serif',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Go to Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/sign-in"
                  className="flex-1 text-center py-2 rounded-md text-sm"
                  style={{
                    color: 'rgba(217,240,229,0.65)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Login
                </a>
                <a
                  href="/sign-up"
                  className="flex-1 text-center py-2 rounded-md text-sm font-medium"
                  style={{
                    color: '#d9f0e5',
                    backgroundColor: '#1a6b42',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
