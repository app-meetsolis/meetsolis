'use client';
import React, { useEffect, useRef, useState } from 'react';

interface TestimonialCardProps {
  quote: string;
  name?: string;
  role?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  faded?: boolean;
}

const QuoteIcon = () => (
  <svg width="14" height="28" viewBox="0 0 14.222 28.444" fill="none">
    <path
      d="M 0 0 L 14.222 0 L 14.222 14.222 L 0 14.222 Z M 14.222 14.222 L 14.222 28.444 L 0 14.222 Z"
      fill="#1a6b42"
    />
  </svg>
);

function TestimonialCard({
  quote,
  name,
  role,
  avatarSrc,
  avatarAlt,
  faded,
}: TestimonialCardProps) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-xl"
      style={{
        backgroundColor: '#f0ede6',
        boxShadow: '0 4px 28px rgba(0,0,0,0.28)',
        opacity: faded ? 0.45 : 1,
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          <QuoteIcon />
          <QuoteIcon />
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: '1.3em',
            color: '#0d1410',
            margin: 0,
          }}
        >
          {quote}
        </p>
      </div>

      {name && (
        <div className="flex flex-col gap-3">
          <div
            className="w-full h-px"
            style={{ backgroundColor: 'rgba(10,30,20,0.1)' }}
          />
          <div className="flex items-center gap-3">
            {avatarSrc && (
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={avatarAlt || `${name} profile photo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0d1410',
                  margin: 0,
                }}
              >
                {name}
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#5a6a60',
                  margin: 0,
                }}
              >
                {role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const col1 = [
  {
    quote:
      "I used to spend 20 minutes re-reading notes before every call. Now I ask Solis one question and I'm fully prepared. My clients have noticed the difference.",
    name: 'Sarah Chen',
    role: 'Executive Coach · ICF-PCC',
    avatarSrc:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Sarah Chen',
  },
  {
    quote:
      'Finally a tool built for coaches, not project managers. It understands what matters in a session.',
  },
  {
    quote:
      "The summaries capture nuance I wouldn't have thought to write down myself. It's like having an assistant who actually understands coaching.",
    name: 'Daniel Moreau',
    role: 'Leadership Coach · 200+ clients',
    avatarSrc:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Daniel Moreau',
    faded: true,
  },
];

const col2 = [
  {
    quote:
      'I coach 22 clients a week. Keeping context across all of them was my biggest blind spot. MeetSolis closed it completely.',
    name: 'Marcus Webb',
    role: 'Business Coach & Consultant',
    avatarSrc:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Marcus Webb',
  },
  {
    quote:
      'The action items section alone changed how I run follow-ups. My clients show up knowing I remembered everything — because I actually did.',
    name: 'Marcus Webb',
    role: 'Business Coach & Consultant',
    avatarSrc:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Marcus Webb',
  },
  {
    quote:
      'I was skeptical about AI in coaching. MeetSolis changed my mind — it handles the admin so I can stay fully present.',
    faded: true,
  },
];

const col3 = [
  {
    quote:
      "Solis Intelligence is like having a co-pilot who read every session note I've ever written. The answers it gives are frighteningly accurate.",
  },
  {
    quote:
      "Session prep used to take me an hour. Now it takes five minutes. I'm a better coach because of that time back.",
    name: 'Priya Nair',
    role: 'Executive Coach · ICF-MCC',
    avatarSrc:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Priya Nair',
  },
  {
    quote:
      'My clients feel heard in a way that goes beyond the session. MeetSolis makes continuity effortless.',
    name: 'Daniel Moreau',
    role: 'Leadership Coach · 200+ clients',
    avatarSrc:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    avatarAlt: 'Daniel Moreau',
    faded: true,
  },
];

export default function NoveraTestimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(32px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  });

  return (
    <section
      id="testimonials"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <div ref={sectionRef} className="max-w-[1248px] mx-auto px-6 py-32">
        <div className="flex flex-col items-center gap-4 mb-16">
          <div className="flex items-center gap-2" style={fadeUp(0)}>
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
              What coaches say
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
              textAlign: 'center',
              ...fadeUp(0.1),
            }}
          >
            Coaches remember more. Clients feel more heard.
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{
            WebkitMask: 'linear-gradient(#000 40%, transparent 90%)',
            mask: 'linear-gradient(#000 40%, transparent 90%)',
          }}
        >
          <div className="flex flex-col gap-4">
            {col1.map((t, i) => (
              <div key={i} style={fadeUp(0.1 + i * 0.12)}>
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {col2.map((t, i) => (
              <div key={i} style={fadeUp(0.18 + i * 0.12)}>
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
          <div className="hidden md:flex flex-col gap-4">
            {col3.map((t, i) => (
              <div key={i} style={fadeUp(0.26 + i * 0.12)}>
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
