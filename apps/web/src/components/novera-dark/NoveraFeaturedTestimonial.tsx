'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function NoveraFeaturedTestimonial() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(28px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  return (
    <section
      id="mission"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <div
        ref={ref}
        className="max-w-[860px] mx-auto px-6 py-24 flex flex-col items-center text-center gap-8"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(45,158,95,0.45)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={fadeUp(0)}
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>

        <p
          style={{
            fontFamily: 'Petrona, serif',
            fontSize: 'clamp(26px, 3.5vw, 44px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: '1.35em',
            color: '#d9f0e5',
            margin: 0,
            ...fadeUp(0.15),
          }}
        >
          The best client relationships are built on memory.{' '}
          <span style={{ color: '#2d9e5f' }}>
            We built MeetSolis so yours never fails.
          </span>
        </p>

        <div className="flex flex-col items-center gap-3" style={fadeUp(0.3)}>
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'rgba(45,158,95,0.4)',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: 'rgba(184,197,191,0.5)',
              letterSpacing: '0.06em',
            }}
          >
            — MEETSOLIS
          </span>
        </div>
      </div>
    </section>
  );
}
