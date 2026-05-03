'use client';
import React, { useEffect, useRef, useState } from 'react';

const KF = `
@keyframes cta-word {
  from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0px);  }
}
@keyframes cta-fade {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;

const line1 = ['Ready', 'to', 'never', 'forget'];
const line2 = ['a', "client's", 'breakthrough?'];

export default function NoveraCTASection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const wordStyle = (i: number): React.CSSProperties => ({
    display: 'inline-block',
    opacity: 0,
    animation: visible
      ? `cta-word 0.75s cubic-bezier(0.22,1,0.36,1) forwards`
      : 'none',
    animationDelay: `${i * 0.1}s`,
  });

  const fadeStyle = (delay: number): React.CSSProperties => ({
    opacity: 0,
    animation: visible ? `cta-fade 0.7s ease forwards` : 'none',
    animationDelay: `${delay}s`,
  });

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: '#0b1612',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{KF}</style>

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '500px',
          background:
            'radial-gradient(ellipse, rgba(26,107,66,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={ref}
        className="relative max-w-[780px] mx-auto px-6 py-32 flex flex-col items-center text-center gap-6"
      >
        {/* Heading */}
        <h2
          style={{
            fontFamily: 'Petrona, serif',
            fontSize: 'clamp(40px, 6vw, 68px)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: '1.12em',
            color: '#ffffff',
            margin: 0,
          }}
        >
          {/* Line 1 — white */}
          <span style={{ display: 'block' }}>
            {line1.map((word, i) => (
              <span key={i} style={{ ...wordStyle(i), marginRight: '0.22em' }}>
                {word}
              </span>
            ))}
          </span>
          {/* Line 2 — green italic */}
          <em
            style={{ color: '#2d9e5f', fontStyle: 'italic', display: 'block' }}
          >
            {line2.map((word, i) => (
              <span
                key={i}
                style={{
                  ...wordStyle(line1.length + i),
                  marginRight: i < line2.length - 1 ? '0.22em' : 0,
                }}
              >
                {word}
              </span>
            ))}
          </em>
        </h2>

        {/* Subtext */}
        <p
          style={{
            ...fadeStyle(0.75),
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: 'rgba(184,197,191,0.65)',
            margin: 0,
          }}
        >
          Start for free. No credit card required.
        </p>

        {/* CTA button */}
        <div style={fadeStyle(0.9)}>
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium"
            style={{
              backgroundColor: '#1a6b42',
              color: '#d9f0e5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              textDecoration: 'none',
              marginTop: '8px',
              transition:
                'filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.boxShadow =
                '0 6px 24px rgba(26,107,66,0.5)';
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
            Get started free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Below button */}
        <p
          style={{
            ...fadeStyle(1.05),
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: 'rgba(184,197,191,0.35)',
            margin: 0,
          }}
        >
          Free plan available · Upgrade anytime
        </p>
      </div>
    </section>
  );
}
