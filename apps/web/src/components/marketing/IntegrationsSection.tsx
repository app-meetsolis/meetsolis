'use client';
import React from 'react';
import Image from 'next/image';

const integrations = [
  {
    name: 'Flowlink',
    description: 'Team chat and alert system',
    image:
      'https://framerusercontent.com/images/k3DYExJloLpyuH8vw9JInbj0oZw.jpg',
  },
  {
    name: 'Chainkit',
    description: 'Automation across all tools',
    image: 'https://framerusercontent.com/images/XC4O6lN2uqvVyMpafT5uIZs7g.jpg',
  },
  {
    name: 'Leadnest',
    description: 'CRM for growth teams',
    image:
      'https://framerusercontent.com/images/LHlGAle7flIiScgLeQ08uifC0Y.jpg',
  },
];

export default function IntegrationsSection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      id="integrations"
      style={{
        backgroundColor: '#ffffff',
        padding: '64px',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
      }}
    >
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left: Text */}
        <div className="flex flex-col gap-6 max-w-[500px]">
          <div className="flex flex-col gap-4">
            <span className="section-badge" style={{ width: 'fit-content' }}>
              WORK WITH YOUR TOOLS
            </span>
            <h3
              style={{
                fontSize: '36px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: '1.1em',
                color: '#000000',
              }}
            >
              Seamless Integrations, <br />
              Zero Hassle
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
            Connect your favorite tools in seconds — from communication to data,
            our agents work wherever you do.
          </p>
          <a
            href="#"
            className="btn-dark"
            style={{ width: 'fit-content', padding: '14px 20px' }}
          >
            Explore Features
          </a>
        </div>

        {/* Right: Integration Cards */}
        <div className="flex flex-col gap-3 w-full md:w-auto md:flex-1">
          {integrations?.map((integration, i) => (
            <div
              key={i}
              className="integration-card"
              style={{
                backgroundColor: 'rgb(250,250,251)',
                borderRadius: '16px',
                padding: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '1000px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={integration?.image}
                  alt={integration?.name}
                  width={36}
                  height={36}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h5
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000',
                    lineHeight: '1em',
                  }}
                >
                  {integration?.name}
                </h5>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.7)',
                    lineHeight: '1.5em',
                  }}
                >
                  {integration?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
