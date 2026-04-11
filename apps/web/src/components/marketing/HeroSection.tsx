'use client';
import React from 'react';

import Image from 'next/image';

export default function HeroSection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      style={{ padding: '24px' }}
    >
      <div
        className="w-full max-w-[1200px] rounded-[32px] overflow-hidden relative"
        style={{
          background: 'linear-gradient(118.66deg, #000000 0%, #273241 100%)',
          padding: '96px',
          minHeight: '500px',
        }}
      >
        {/* Blurred green circles */}
        <div
          className="absolute hidden md:block"
          style={{
            width: '752px',
            height: '752px',
            borderRadius: '100%',
            backgroundColor: 'rgb(149, 244, 204)',
            filter: 'blur(150px)',
            opacity: 0.4,
            bottom: '-156px',
            right: '-508px',
            zIndex: 1,
          }}
        />

        <div
          className="absolute hidden md:block"
          style={{
            width: '586px',
            height: '586px',
            borderRadius: '100%',
            backgroundColor: 'rgb(149, 244, 204)',
            filter: 'blur(150px)',
            opacity: 0.6,
            bottom: '-538px',
            left: '496px',
            zIndex: 1,
          }}
        />

        <div
          className="absolute hidden md:block"
          style={{
            width: '586px',
            height: '586px',
            borderRadius: '100%',
            backgroundColor: 'rgb(149, 244, 204)',
            filter: 'blur(150px)',
            right: '-425px',
            top: '-150px',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left: Text */}
          <div className="flex flex-col gap-8 max-w-[500px]">
            {/* Early access badge */}
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-xl px-4 py-2 w-fit"
              style={{
                backgroundColor: '#000000',
                boxShadow:
                  'inset 0 1px 0 0 rgb(39,50,65), inset 0 -1px 0 0 rgba(0,0,0,0.53)',
                borderRadius: '12px',
              }}
            >
              <svg width="17" height="20" viewBox="0 0 17 20" fill="none">
                <path
                  d="M 0 3.75 C 0 2.599 0.951 1.667 2.125 1.667 L 6.375 1.667 C 7.549 1.667 8.5 2.599 8.5 3.75 L 8.5 7.841 C 8.5 7.866 8.5 7.891 8.5 7.917 C 8.5 9.066 9.449 9.997 10.62 10 C 10.622 10 10.623 10 10.625 10 L 14.875 10 C 16.049 10 17 10.933 17 12.083 L 17 16.25 C 17 17.401 16.049 18.333 14.875 18.333 L 10.625 18.333 C 9.451 18.333 8.5 17.401 8.5 16.25 L 8.5 12.083 C 8.5 12.078 8.5 12.072 8.5 12.066 C 8.491 10.923 7.543 10 6.375 10 C 6.37 10 6.364 10 6.359 10 L 2.125 10 C 0.951 10 0 9.067 0 7.917 Z"
                  fill="rgb(28, 211, 163)"
                />
              </svg>
              <div
                className="w-px h-9"
                style={{ backgroundColor: 'rgb(39,50,65)' }}
              />
              <span
                style={{
                  color: 'rgb(233,235,239)',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Request early access
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                width="16"
                height="16"
                fill="rgb(155,165,181)"
              >
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </a>

            {/* Headline */}
            <div className="flex flex-col gap-0">
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 500,
                  letterSpacing: '-4px',
                  lineHeight: '1em',
                  color: '#ffffff',
                  fontFamily: 'Geist, sans-serif',
                }}
              >
                Automate Smarter
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  style={{
                    fontSize: '64px',
                    fontWeight: 500,
                    letterSpacing: '-4px',
                    lineHeight: '1em',
                    color: '#ffffff',
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  Grow
                </h1>
                <h1
                  style={{
                    fontSize: '64px',
                    fontWeight: 500,
                    letterSpacing: '-4px',
                    lineHeight: '1em',
                    color: 'rgb(55, 234, 158)',
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  Leaner.
                </h1>
              </div>
            </div>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '18px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: '1.5em',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Unlock your team&apos;s full potential with AI agents that save
              time, cut costs, and scale with you — no code, no clutter, just
              results.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#"
                className="btn-white"
                style={{
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Explore Agents
              </a>
              <a
                href="#"
                className="btn-outline-white"
                style={{
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Book a Demo
              </a>
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: '400px',
                maxWidth: '100%',
              }}
            />

            {/* Feature badges */}
            <div className="flex items-center gap-6 flex-wrap">
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
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '1.5em',
                    }}
                  >
                    Built for Speed
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Get started in minutes
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
                  <path d="M188.87,65A18,18,0,0,0,157.62,83L133.36,41a18,18,0,0,0-31.22,18L96.4,49A18,18,0,0,0,65.18,67l3.34,5.77A26,26,0,0,0,39.74,111l3,5.2A26,26,0,0,0,23.5,155l35.27,61a80.14,80.14,0,0,0,149.52-39.57A71.92,71.92,0,0,0,210,101.58Zm1.2,127.56A64.12,64.12,0,0,1,72.65,208L37.38,147a10,10,0,0,1,17.34-10L75,172a8,8,0,0,0,13.87-8L53.62,103A10,10,0,0,1,71,93l31.81,55a8,8,0,0,0,13.87-8l-26-45a10,10,0,0,1,17.35-10l36.5,63a8,8,0,0,0,13.87-8l-12.6-21.75A10,10,0,0,1,163.44,109l20.22,35A63.52,63.52,0,0,1,190.07,192.57Z" />
                </svg>
                <div>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '1.5em',
                    }}
                  >
                    No-Code Friendly
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Launch and manage easily
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div
            className="hidden md:block relative"
            style={{ width: '400px', height: '464px', flexShrink: 0 }}
          >
            <div
              className="absolute"
              style={{
                width: '890px',
                aspectRatio: '1.4285714 / 1',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow:
                  '0 120px 164px -25px rgba(107,110,148,0.12), 0 2px 4px rgba(0,0,0,0.25)',
                mask: 'linear-gradient(31deg, rgba(0,0,0,0) 26%, rgba(0,0,0,1) 54%)',
                WebkitMask:
                  'linear-gradient(31deg, rgba(0,0,0,0) 26%, rgba(0,0,0,1) 54%)',
                border: '1px solid rgb(155,165,181)',
                top: 0,
                right: '-417px',
              }}
            >
              <Image
                src="https://framerusercontent.com/images/eZbnTBB4KblwMdFBajxNbPBhog.jpg"
                alt="Dashboard preview"
                width={890}
                height={623}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
