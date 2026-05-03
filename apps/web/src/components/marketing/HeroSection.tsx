'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="w-full flex flex-col items-center p-3 md:p-6">
      <div
        className="w-full max-w-[1200px] rounded-[32px] overflow-hidden relative px-6 py-12 sm:px-12 sm:py-16 md:px-16 lg:px-24 lg:py-24"
        style={{
          background: 'linear-gradient(118.66deg, #000000 0%, #273241 100%)',
          minHeight: '500px',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute hidden md:block pointer-events-none"
          style={{
            width: 752,
            height: 752,
            borderRadius: '100%',
            backgroundColor: 'rgb(149,244,204)',
            filter: 'blur(150px)',
            opacity: 0.4,
            bottom: -156,
            right: -508,
            zIndex: 1,
          }}
        />
        <div
          className="absolute hidden md:block pointer-events-none"
          style={{
            width: 586,
            height: 586,
            borderRadius: '100%',
            backgroundColor: 'rgb(149,244,204)',
            filter: 'blur(150px)',
            opacity: 0.6,
            bottom: -538,
            left: 496,
            zIndex: 1,
          }}
        />
        <div
          className="absolute hidden md:block pointer-events-none"
          style={{
            width: 586,
            height: 586,
            borderRadius: '100%',
            backgroundColor: 'rgb(149,244,204)',
            filter: 'blur(150px)',
            right: -425,
            top: -150,
            zIndex: 1,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left: Text */}
          <div className="flex flex-col gap-8 w-full md:max-w-[500px]">
            {/* Headline */}
            <div className="flex flex-col gap-0">
              {(['Every session.', 'Every client.'] as const).map(line => (
                <h1
                  key={line}
                  style={{
                    fontSize: 'clamp(36px, 6vw, 64px)',
                    fontWeight: 600,
                    letterSpacing: 'clamp(-1.5px, -0.4vw, -3px)',
                    lineHeight: '1.05em',
                    color: '#ffffff',
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  {line}
                </h1>
              ))}
              {/* Italic serif line — the emotional hook */}
              <h1
                style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  fontWeight: 400,
                  letterSpacing: 'clamp(-1px, -0.2vw, -2px)',
                  lineHeight: '1.1em',
                  color: 'rgb(55,234,158)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                }}
              >
                Never forgotten.
              </h1>
            </div>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '18px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: '1.5em',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-outfit)',
              }}
            >
              Upload any session transcript. Get AI summaries, action items, and
              a searchable memory — so you always show up fully prepared.
            </p>

            {/* Single CTA */}
            <div>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-[16px] font-semibold text-black transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37ea9e] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'rgb(55,234,158)',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                Start Free
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                </svg>
              </Link>
              <p
                style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 500,
                }}
              >
                No credit card required · Free forever plan
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: 400,
                maxWidth: '100%',
              }}
            />

            {/* Trust badges */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="32"
                  height="32"
                  fill="rgb(55,234,158)"
                >
                  <path d="M208,40H48A16,16,0,0,0,32,56V216a8,8,0,0,0,13,6.22L128,163.28l83,58.94A8,8,0,0,0,224,216V56A16,16,0,0,0,208,40Z" />
                </svg>
                <div>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '1.4em',
                    }}
                  >
                    Private by Design
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Your data trains no AI model
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  width="32"
                  height="32"
                  fill="rgb(55,234,158)"
                >
                  <path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z" />
                </svg>
                <div>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '1.4em',
                    }}
                  >
                    Any Platform
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Zoom, Meet, Teams & more
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard screenshot — zoomed into main content area */}
          <div
            className="hidden md:block relative"
            style={{ width: '400px', height: '464px', flexShrink: 0 }}
          >
            <div
              className="absolute"
              style={{
                width: '820px',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow:
                  '0 32px 64px -8px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                top: 0,
                right: '-360px',
                mask: 'linear-gradient(28deg, rgba(0,0,0,0) 14%, rgba(0,0,0,1) 44%)',
                WebkitMask:
                  'linear-gradient(28deg, rgba(0,0,0,0) 14%, rgba(0,0,0,1) 44%)',
              }}
            >
              {/* Browser toolbar */}
              <div
                style={{
                  background: 'rgb(18,22,28)',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: 'rgb(255,95,86)',
                    }}
                  />
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: 'rgb(255,189,46)',
                    }}
                  />
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: 'rgb(39,201,63)',
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '5px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                >
                  app.meetsolis.com/dashboard
                </div>
              </div>
              {/* Screenshot — zoomed to skip sidebar, focus on main content */}
              <div style={{ overflow: 'hidden', height: '440px' }}>
                <Image
                  src="/images/dashboard-preview.png"
                  alt="MeetSolis dashboard"
                  width={960}
                  height={497}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    transform: 'scale(1.3)',
                    transformOrigin: 'top left',
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
