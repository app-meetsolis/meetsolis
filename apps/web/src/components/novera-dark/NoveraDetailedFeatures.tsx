'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  objectPosition?: string;
}

const features: Feature[] = [
  {
    id: 'dashboard',
    title: 'Your Command Center',
    description:
      'See every client, every open action, and who needs attention — the moment you log in. No digging, no guessing.',
    imageSrc: '/screenshots/dashboard-home.png',
    imageAlt: 'MeetSolis dashboard overview',
    objectPosition: '20% center',
  },
  {
    id: 'clients',
    title: 'All Your Clients, One Place',
    description:
      '10 clients or 25 — every client relationship organized by name, goal, and progress. Pick up exactly where you left off.',
    imageSrc: '/screenshots/clients-list.png',
    imageAlt: 'MeetSolis client management',
  },
  {
    id: 'sessions',
    title: 'Every Session, Perfectly Captured',
    description:
      'Key topics. Breakthrough moments. Action items. Each session becomes a structured brief you can revisit before the next call.',
    imageSrc: '/screenshots/session-detail.png',
    imageAlt: 'MeetSolis session detail and AI summary',
    objectPosition: '20% center',
  },
  {
    id: 'actions',
    title: 'Every Promise, Kept',
    description:
      'Every commitment you make gets tracked. Every follow-up gets surfaced before the next session. Show up prepared — nothing falls through the cracks.',
    imageSrc: '/screenshots/action-tracking.png',
    imageAlt: 'MeetSolis action tracking',
  },
  {
    id: 'intelligence',
    title: 'Ask Anything About Any Client',
    description:
      '"What has Sarah been struggling with?" "Which clients haven\'t met in 30 days?" Solis searches your entire client history instantly.',
    imageSrc: '/screenshots/solis-intelligence.png',
    imageAlt: 'Solis Intelligence AI chat',
    objectPosition: '20% center',
  },
];

export default function NoveraDetailedFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        // 0 = at center, 1 = fully off-center
        const norm = Math.min(1, distance / (window.innerHeight * 0.52));

        card.style.transform = `translateX(${norm * -38}px)`;

        const overlay = overlayRefs.current[i];
        if (overlay) overlay.style.opacity = String(norm * 0.58);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      setActiveFeature(prev => (prev === closestIndex ? prev : closestIndex));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <section
      id="detailed-features"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <div className="max-w-[1248px] mx-auto px-6 py-16 lg:py-32">
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
              Built for Professionals
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Petrona, serif',
              fontSize: 'clamp(32px, 3.5vw, 40px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: '1.1em',
              color: '#d9f0e5',
              margin: 0,
            }}
          >
            Everything you need to remember every client, every time.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '1.4em',
              color: '#b8c5bf',
              margin: 0,
            }}
          >
            From session summaries to AI-powered memory — MeetSolis keeps your
            entire practice in sync.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left: scroll-driven cards */}
          <div className="flex-1 flex flex-col gap-10 lg:gap-16">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                ref={el => {
                  cardRefs.current[index] = el;
                }}
                className="w-full"
                style={{ willChange: 'transform' }}
              >
                <div
                  className="w-full overflow-hidden rounded-xl border"
                  style={{
                    borderColor: 'rgba(26,107,66,0.2)',
                    aspectRatio: '4/3',
                    position: 'relative',
                  }}
                >
                  <img
                    src={feature.imageSrc}
                    alt={feature.imageAlt}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: feature.objectPosition ?? 'center',
                    }}
                  />
                  {/* Scroll-driven overlay — dimmed when off-center */}
                  <div
                    ref={el => {
                      overlayRefs.current[index] = el;
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#0b1612',
                      opacity: 0.55,
                      pointerEvents: 'none',
                      transition: 'opacity 0.08s linear',
                    }}
                  />
                </div>

                {/* Mobile-only: title + description below each card */}
                <div className="mt-4 lg:hidden">
                  <p
                    style={{
                      fontFamily: 'Petrona, serif',
                      fontSize: '22px',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      color: '#d9f0e5',
                      margin: '0 0 8px 0',
                      lineHeight: '1.2em',
                    }}
                  >
                    {feature.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#b8c5bf',
                      lineHeight: '1.5em',
                      margin: 0,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: sticky sidebar */}
          <div
            className="hidden lg:flex flex-col gap-2 w-80"
            style={{
              position: 'sticky',
              top: '128px',
              alignSelf: 'flex-start',
            }}
          >
            {features.map((feature, index) => {
              const isActive = activeFeature === index;
              return (
                <button
                  key={feature.id}
                  onClick={() =>
                    cardRefs.current[index]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                  className="w-full rounded-xl overflow-hidden text-left"
                  style={{
                    background: '#f0ede6',
                    border: isActive
                      ? '1px solid rgba(10,30,20,0.15)'
                      : '1px solid rgba(10,30,20,0.08)',
                    boxShadow: isActive
                      ? '0 6px 28px rgba(0,0,0,0.4)'
                      : '0 2px 8px rgba(0,0,0,0.25)',
                    cursor: 'pointer',
                    transition:
                      'border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease',
                    padding: 0,
                  }}
                >
                  <div className="px-5 py-5">
                    <div className="flex items-center justify-between">
                      <p
                        style={{
                          fontFamily: 'Petrona, serif',
                          fontSize: '20px',
                          fontWeight: 500,
                          letterSpacing: '-0.02em',
                          color: '#0d1410',
                          margin: 0,
                          transition: 'color 0.35s ease',
                        }}
                      >
                        {feature.title}
                      </p>
                      {/* Chevron indicator */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isActive ? '#1a6b42' : '#5a7a60'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isActive
                            ? 'rotate(90deg)'
                            : 'rotate(0deg)',
                          transition: 'transform 0.35s ease, stroke 0.35s ease',
                          flexShrink: 0,
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    <div
                      style={{
                        maxHeight: isActive ? '160px' : '0px',
                        overflow: 'hidden',
                        transition:
                          'max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: isActive ? '#4a5a50' : '#7aab90',
                          lineHeight: '1.5em',
                          margin: '10px 0 0 0',
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Active bottom accent line */}
                  <div
                    style={{
                      height: '2px',
                      background: isActive
                        ? 'linear-gradient(to right, rgba(26,107,66,0.35), transparent)'
                        : 'transparent',
                      transition: 'background 0.35s ease',
                    }}
                  />
                </button>
              );
            })}

            <a
              href="#"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium mt-1 transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: '#1a6b42',
                color: '#d9f0e5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                textDecoration: 'none',
                transition:
                  'transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'brightness(1.08)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(26,107,66,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'scale(0.97)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Get started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
