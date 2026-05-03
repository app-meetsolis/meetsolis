'use client';
import React, { useRef, useEffect, useState } from 'react';

const problems = [
  {
    title: 'The session that started over',
    problem:
      'Your notes are thin. You rebuild context instead of building on it.',
    solution:
      'MeetSolis surfaces every summary, topic, and action from every previous session — instantly.',
  },
  {
    title: 'The follow-up that never happened',
    problem:
      "A client asks if you followed up on something. You don't remember what they mean.",
    solution:
      'Every commitment is captured automatically and flagged before the next session.',
  },
  {
    title: 'The Friday 5pm session',
    problem:
      "By client eight, you're present — but not as sharp as you were at 9am.",
    solution:
      "Solis holds every client's full history so you always walk in prepared, not catching up.",
  },
];

export default function NoveraTrustSafety() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="the-problem"
      className="w-full"
      style={{ backgroundColor: '#0e1d16' }}
    >
      <div ref={ref} className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left: headline block */}
          <div
            className="flex flex-col gap-8 lg:max-w-[400px]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="flex flex-col gap-5">
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
                  The Reality
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'Petrona, serif',
                  fontSize: 'clamp(34px, 3.8vw, 50px)',
                  fontWeight: 500,
                  letterSpacing: '-0.04em',
                  lineHeight: '1.1em',
                  color: '#d9f0e5',
                  margin: 0,
                }}
              >
                You care about every client.
                <br />
                <span style={{ color: '#2d9e5f' }}>
                  Your memory doesn&apos;t.
                </span>
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.6em',
                  color: '#8aaa9a',
                  margin: 0,
                }}
              >
                No one can hold 15 client journeys in their head at once.
                Something always slips — and your clients notice.
              </p>
            </div>
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium self-start"
              style={{
                backgroundColor: '#1a6b42',
                color: '#d9f0e5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                transition:
                  'filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
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
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Start remembering everything
            </a>
          </div>

          {/* Right: problem → solution cards */}
          <div className="flex-1 flex flex-col gap-4">
            {problems.map((p, i) => (
              <div
                key={i}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(28px)',
                  transition: 'opacity 0.65s ease, transform 0.65s ease',
                  transitionDelay: `${0.15 + i * 0.14}s`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                {/* Problem half */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderLeft: '3px solid rgba(210,140,55,0.6)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Petrona, serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      color: '#d9f0e5',
                      margin: '0 0 5px 0',
                    }}
                  >
                    {p.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      lineHeight: '1.5em',
                      color: '#7a9a8a',
                      margin: 0,
                    }}
                  >
                    {p.problem}
                  </p>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                  }}
                />

                {/* Solution half */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderLeft: '3px solid rgba(26,107,66,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2d9e5f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      lineHeight: '1.5em',
                      color: '#4db87a',
                      margin: 0,
                    }}
                  >
                    {p.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
