'use client';
import React from 'react';
import Image from 'next/image';

export default function BuiltForEfficiencySection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      style={{
        backgroundColor: '#ffffff',
        padding: '64px',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
      }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">CORE FEATURES</span>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 600,
                letterSpacing: '-3px',
                lineHeight: '1em',
                color: '#000000',
                textAlign: 'center',
              }}
            >
              Built for Efficiency
            </h2>
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#000000',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Automate smarter with tools that make real business impact every
            day.
          </p>
        </div>

        {/* Duo Content */}
        <div className="flex flex-col gap-16">
          {/* Row 1: Text Left, Image Right */}
          <div className="flex items-center justify-between gap-12">
            <div className="flex flex-col gap-6 max-w-[500px]">
              <div className="flex flex-col gap-4">
                <span
                  className="section-badge"
                  style={{ width: 'fit-content' }}
                >
                  TIME SAVER
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
                  Automate <br />
                  Repetitive Workflows
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
                Free up your team by letting agents handle the tasks nobody
                wants to do manually.
              </p>
              <a
                href="#"
                className="btn-dark"
                style={{ width: 'fit-content', padding: '14px 20px' }}
              >
                Explore Agents
              </a>
            </div>
            <div
              className="hidden md:block rounded-2xl overflow-hidden flex-shrink-0"
              style={{ width: '400px', height: '400px' }}
            >
              <Image
                src="https://framerusercontent.com/images/3rgOEHVe5mM8J6C2xWdS08EI4.png"
                alt="Automate Workflows"
                width={800}
                height={800}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '2px', backgroundColor: 'rgb(233,235,239)' }} />

          {/* Row 2: Image Left, Text Right */}
          <div className="flex items-center justify-between gap-12">
            <div
              className="hidden md:block rounded-2xl overflow-hidden flex-shrink-0"
              style={{ width: '400px', height: '400px' }}
            >
              <Image
                src="https://framerusercontent.com/images/XPxwo6N9K8yltJAsNqWlztlsA.png"
                alt="No Code"
                width={800}
                height={800}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div className="flex flex-col gap-6 max-w-[500px]">
              <div className="flex flex-col gap-4">
                <span
                  className="section-badge"
                  style={{ width: 'fit-content' }}
                >
                  NO-CODE
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
                  Use Without <br />
                  Technical Skills
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
                Anyone on your team can launch agents—no setup, no code, no
                learning curve required.
              </p>
              {/* Divider line */}
              <div
                style={{
                  height: '3px',
                  backgroundColor: 'rgb(233,235,239)',
                  width: '100%',
                }}
              />
              {/* Bottom features */}
              <div className="flex items-center gap-12">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    width="32"
                    height="32"
                    fill="rgb(22,167,129)"
                  >
                    <path d="M72,92A12,12,0,1,1,60,80,12,12,0,0,1,72,92Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,128,80Zm68,24a12,12,0,1,0-12-12A12,12,0,0,0,196,104ZM60,152a12,12,0,1,0,12,12A12,12,0,0,0,60,152Zm68,0a12,12,0,1,0,12,12A12,12,0,0,0,128,152Zm68,0a12,12,0,1,0,12,12A12,12,0,0,0,196,152Z" />
                  </svg>
                  <div>
                    <p
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Drag &amp; Drop
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.7)',
                      }}
                    >
                      Build flows visually
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    width="32"
                    height="32"
                    fill="rgb(22,167,129)"
                  >
                    <path d="M88,24V16a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0ZM16,104h8a8,8,0,0,0,0-16H16a8,8,0,0,0,0,16ZM219.31,184a16,16,0,0,1,0,22.63l-12.68,12.68a16,16,0,0,1-22.63,0L132.7,168,115,214.09c0,.1-.08.21-.13.32a15.83,15.83,0,0,1-14.6,9.59l-.79,0a15.83,15.83,0,0,1-14.41-11L32.8,52.92A16,16,0,0,1,52.92,32.8L213,85.07a16,16,0,0,1,1.41,29.8l-.32.13L168,132.69Z" />
                  </svg>
                  <div>
                    <p
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      One-Click Launch
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.7)',
                      }}
                    >
                      Deploy agents instantly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
