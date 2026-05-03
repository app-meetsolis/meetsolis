'use client';
import React from 'react';

const moments = [
  {
    step: '01',
    name: 'Before Your Next Session',
    description:
      'Ask Solis what you covered last time. Walk in prepared — every goal, concern, and breakthrough recalled instantly.',
  },
  {
    step: '02',
    name: 'The Moment a Session Ends',
    description:
      'Notes, action items, and a full summary are generated before you close your laptop. Zero admin. Zero effort.',
  },
  {
    step: '03',
    name: 'When a Client Mentions Something',
    description:
      '"Didn\'t we cover this 3 months ago?" — Yes. Solis finds the exact session, the exact quote, in seconds.',
  },
];

export default function IntegrationsSection() {
  return (
    <section
      className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16"
      id="integrations"
      style={{
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
      }}
    >
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left: Text */}
        <div className="flex flex-col gap-6 max-w-[500px]">
          <div className="flex flex-col gap-4">
            <span className="section-badge" style={{ width: 'fit-content' }}>
              BUILT FOR YOUR WORKFLOW
            </span>
            <h3
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: '1.1em',
                color: '#000000',
              }}
            >
              Before, during, and after <br />
              every session — covered.
            </h3>
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: 'rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            MeetSolis fits into every stage of your coaching process. No new
            habits, no extra admin — just more time to focus on your clients.
          </p>
          <a
            href="#"
            className="btn-dark"
            style={{ width: 'fit-content', padding: '14px 20px' }}
          >
            Get Started Free
          </a>
        </div>

        {/* Right: Integration Cards */}
        <div className="flex flex-col gap-3 w-full md:w-auto md:flex-1">
          {moments?.map((moment, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'rgb(250,250,251)',
                borderRadius: '16px',
                padding: '25px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'rgb(106,235,201)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {moment?.step}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h5
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                    lineHeight: '1.2em',
                  }}
                >
                  {moment?.name}
                </h5>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.7)',
                    lineHeight: '1.5em',
                  }}
                >
                  {moment?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
