'use client';
import React, { useRef, useEffect } from 'react';

export default function NoveraHeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', backgroundColor: '#000', minHeight: '600px' }}
    >
      <style>{`
        @keyframes heroZoomOut {
          from { transform: scale(1.14); opacity: 0.8; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .hero-img-zoom {
          animation: heroZoomOut 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes wordReveal {
          from {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
        .wr {
          display: inline-block;
          animation: wordReveal 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* Image wrapper: extends 15% above/below to give parallax room, moves at 30% scroll speed */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 z-0"
        style={{ top: '-15%', height: '130%' }}
      >
        <img
          src="/images/hero-dark-green.jpg"
          alt="Professional working on laptop in a dark modern office"
          className="w-full h-full object-cover hero-img-zoom"
          style={{ objectPosition: 'center 35%' }}
        />
      </div>

      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(5,14,8,0.3) 100%)',
        }}
      />

      <div className="relative z-20 h-full flex flex-col justify-end">
        <div className="w-full pl-6 sm:pl-14 pr-6 pb-12 sm:pb-16">
          <div className="max-w-[780px]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h1
                  style={{
                    fontFamily: 'Petrona, serif',
                    fontSize: 'clamp(40px, 5vw, 56px)',
                    fontWeight: 400,
                    letterSpacing: '-0.04em',
                    lineHeight: '1.15em',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {['Never', 'forget', 'a', "client's"].map((word, i) => (
                    <span
                      key={i}
                      className="wr"
                      style={{
                        animationDelay: `${0.1 + i * 0.09}s`,
                        marginRight: '0.22em',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                  <br />
                  {['breakthrough', 'moment', 'again.'].map((word, i) => (
                    <span
                      key={i}
                      className="wr"
                      style={{
                        color: '#2d9e5f',
                        animationDelay: `${0.48 + i * 0.09}s`,
                        marginRight: i < 2 ? '0.22em' : 0,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.6em',
                    color: 'rgba(195, 205, 200, 0.85)',
                    maxWidth: '380px',
                    margin: 0,
                  }}
                >
                  {`MeetSolis turns your client sessions into a searchable memory — so every conversation builds on the last.`
                    .split(' ')
                    .map((word, i, arr) => (
                      <span
                        key={i}
                        className="wr"
                        style={{
                          animationDelay: `${0.75 + i * 0.04}s`,
                          marginRight: i < arr.length - 1 ? '0.22em' : 0,
                        }}
                      >
                        {word}
                      </span>
                    ))}
                </p>
              </div>

              <div className="wr" style={{ animationDelay: '1.55s' }}>
                <a
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium"
                  style={{
                    backgroundColor: '#1a6b42',
                    color: '#d9f0e5',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition:
                      'transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.18s ease, box-shadow 0.18s ease',
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
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Get started free
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
