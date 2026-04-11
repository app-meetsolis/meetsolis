'use client';
import React from 'react';
import Image from 'next/image';

export default function MetricsSection() {
  const chartBars = [
    { height: 40, value: 1200 },
    { height: 55, value: 1800 },
    { height: 45, value: 1500 },
    { height: 70, value: 2400 },
    { height: 60, value: 2000 },
    { height: 85, value: 2800 },
    { height: 75, value: 2500 },
    { height: 95, value: 3200 },
    { height: 80, value: 2700 },
    { height: 100, value: 3500 },
  ];

  return (
    <section
      className="w-full flex flex-col items-center"
      style={{ padding: '24px', backgroundColor: '#ffffff' }}
    >
      <div
        className="w-full max-w-[1200px] rounded-[32px] overflow-hidden relative"
        style={{
          backgroundColor: '#000000',
          padding: '64px',
        }}
      >
        {/* Green glow effects */}
        <div
          className="absolute"
          style={{
            width: '322px',
            height: '322px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.5,
            bottom: '-169px',
            left: '-14px',
            zIndex: 0,
          }}
        />

        <div
          className="absolute"
          style={{
            width: '950px',
            height: '150px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.3,
            bottom: '-83px',
            left: '-328px',
            zIndex: 0,
          }}
        />

        <div
          className="absolute"
          style={{
            width: '1500px',
            height: '150px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.5,
            bottom: '-84px',
            left: '-603px',
            zIndex: 0,
          }}
        />

        {/* Green bottom bar */}
        <div
          className="absolute bottom-0"
          style={{
            left: 'calc(50% - 448px)',
            width: '896px',
            height: '2px',
            background: 'linear-gradient(90deg, #000, #6aebc9, #000)',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12"
          style={{ maxWidth: '1000px', margin: '0 auto', height: '400px' }}
        >
          {/* Left: Text */}
          <div className="flex flex-col gap-6 max-w-[500px] w-full md:w-[500px]">
            <div className="flex flex-col gap-4">
              <span
                className="section-badge"
                style={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  width: 'fit-content',
                }}
              >
                PRODUCTIVITY BOOST
              </span>
              <h3
                style={{
                  fontSize: '36px',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1em',
                  color: '#ffffff',
                }}
              >
                Measure Real-Time <br />
                Efficiency Gains
              </h3>
            </div>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.02em',
                lineHeight: '1.5em',
              }}
            >
              Instantly track hours saved, tasks completed, and the true impact
              of every deployed agent.
            </p>
            {/* Divider */}
            <div
              style={{
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: '100%',
              }}
            />
            {/* Stats */}
            <div className="flex items-start gap-5">
              <div className="flex flex-col gap-1">
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: 600,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1em',
                  }}
                >
                  +42 hrs
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Time Saved
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: 600,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1em',
                  }}
                >
                  98.6%
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Success Rate
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3
                  style={{
                    fontSize: '36px',
                    fontWeight: 600,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1em',
                  }}
                >
                  $1.8k
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Monthly Value
                </p>
              </div>
            </div>
          </div>

          {/* Right: Chart */}
          <div
            className="hidden md:flex flex-col gap-4 flex-shrink-0"
            style={{
              width: '400px',
              height: '400px',
              justifyContent: 'center',
            }}
          >
            <Image
              src="https://framerusercontent.com/images/sqw7nifq8S0UF5pSA3rJ5hv2k.png"
              alt="Efficiency Chart"
              width={800}
              height={800}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                borderRadius: '16px',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
