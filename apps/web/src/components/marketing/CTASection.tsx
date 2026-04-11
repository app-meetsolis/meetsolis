'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export default function CTASection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section
      className="w-full flex flex-col items-center"
      id="cta"
      style={{ padding: '24px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div
        className="w-full max-w-[1200px] rounded-[32px] overflow-hidden relative"
        style={{
          background: 'linear-gradient(118.66deg, #000000 0%, #273241 100%)',
          padding: '96px',
        }}
      >
        {/* Dot pattern background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(rgba(233,235,239,0) 2.1px, transparent 2.9px)',
            backgroundSize: '60px 60px',
            backgroundPosition: '50% 50%',
            mask: 'radial-gradient(50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
            WebkitMask:
              'radial-gradient(50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Left: Form */}
          <div className="flex flex-col gap-8 max-w-[500px]">
            <span
              className="section-badge"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#ffffff',
                width: 'fit-content',
              }}
            >
              7 DAYS FREE TRIAL
            </span>

            <h2
              style={{
                fontSize: '48px',
                fontWeight: 600,
                letterSpacing: '-3px',
                lineHeight: '1em',
                color: '#ffffff',
              }}
            >
              Try Agent <br />
              for <span style={{ color: 'rgb(55,234,158)' }}>free</span> today
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-3 flex-wrap">
                <input
                  type="email"
                  placeholder="jane@framer.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    height: '40px',
                    backgroundColor: 'rgb(39,50,65)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 400,
                    outline: 'none',
                  }}
                />

                <button
                  type="submit"
                  style={{
                    height: '40px',
                    backgroundColor: 'rgb(55,234,158)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 20px',
                    fontSize: '18px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Get Access
                </button>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Fill the form and start your 7 days free trial! — No credit card
                required.
              </p>
            </form>

            {/* Divider */}
            <div
              style={{
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: '100%',
              }}
            />

            {/* Stats */}
            <div className="flex items-start gap-9">
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
                  447
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Total Agents
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
                  $25.8k
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

          {/* Right: Dashboard Image */}
          <div
            className="hidden md:block flex-shrink-0"
            style={{
              width: '400px',
              height: '464px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '941px',
                height: '659px',
                top: 0,
                left: 0,
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgb(155,165,181)',
                boxShadow:
                  '0 120px 164px -25px rgba(107,110,148,0.12), 0 2px 4px rgba(0,0,0,0.25)',
                mask: 'linear-gradient(31deg, rgba(0,0,0,0) 26%, rgba(0,0,0,1) 54%)',
                WebkitMask:
                  'linear-gradient(31deg, rgba(0,0,0,0) 26%, rgba(0,0,0,1) 54%)',
              }}
            >
              <Image
                src="https://framerusercontent.com/images/eZbnTBB4KblwMdFBajxNbPBhog.jpg"
                alt="Dashboard"
                width={941}
                height={659}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
