'use client';
import React from 'react';

const logos = [
  { name: 'Zoom', src: 'https://cdn.simpleicons.org/zoom', logoOnly: false },
  {
    name: 'Google Meet',
    src: 'https://cdn.simpleicons.org/googlemeet',
    logoOnly: false,
  },
  { name: 'Microsoft Teams', src: null, logoOnly: false },
  { name: 'Loom', src: 'https://cdn.simpleicons.org/loom', logoOnly: false },
  {
    name: 'Notion',
    src: 'https://cdn.simpleicons.org/notion',
    logoOnly: false,
  },
  { name: 'Slack', src: null, logoOnly: false },
  {
    name: 'Calendly',
    src: 'https://cdn.simpleicons.org/calendly',
    logoOnly: false,
  },
  {
    name: 'Google Calendar',
    src: 'https://cdn.simpleicons.org/googlecalendar',
    logoOnly: false,
  },
];

const track = [
  ...logos,
  ...logos,
  ...logos,
  ...logos,
  ...logos,
  ...logos,
  ...logos,
  ...logos,
];

export default function NoveraSocialProof() {
  return (
    <section
      id="social-proof"
      className="w-full py-24"
      style={{ backgroundColor: '#0b1612' }}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-100% / 8), 0, 0); }
        }
        .marquee-track {
          animation: marquee 28s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>

      <div className="max-w-[1248px] mx-auto px-6 flex flex-col items-center gap-10">
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#b8c5bf',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Works with any meeting platform you already use
        </p>
      </div>

      <div
        className="w-full overflow-hidden mt-10"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div
          className="flex items-center marquee-track"
          style={{ width: 'max-content' }}
        >
          {track.map((logo, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ padding: '0 40px', height: '48px', flexShrink: 0 }}
            >
              {logo.src && (
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{
                    height: '32px',
                    width: 'auto',
                    objectFit: 'contain',
                    opacity: 0.5,
                    filter: 'brightness(0) invert(1)',
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  fontWeight: 500,
                  color: 'rgba(184,197,191,0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
