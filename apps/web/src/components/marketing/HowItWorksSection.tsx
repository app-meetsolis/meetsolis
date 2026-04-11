'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const steps = [
  {
    id: '01',
    label: 'Choose Agents',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M84,120a44,44,0,1,1,44,44A44,44,0,0,1,84,120Zm126.16,57.18a8.21,8.21,0,0,0-10.86,2.41,87.42,87.42,0,0,1-5.52,6.85A79.76,79.76,0,0,0,172,165.1a4,4,0,0,0-4.84.32,59.8,59.8,0,0,1-78.26,0A4,4,0,0,0,84,165.1a79.71,79.71,0,0,0-21.79,21.31A87.66,87.66,0,0,1,40.37,136h15.4a8.2,8.2,0,0,0,6.69-3.28,8,8,0,0,0-.8-10.38l-24-24a8,8,0,0,0-11.32,0l-24,24a8,8,0,0,0-.8,10.38A8.2,8.2,0,0,0,8.23,136H24.3a104,104,0,0,0,188.18,52.67A8,8,0,0,0,210.16,177.18Zm45.23-52.24A8,8,0,0,0,248,120H231.7A104,104,0,0,0,43.52,67.33a8,8,0,0,0,13,9.34A88,88,0,0,1,215.63,120H200a8,8,0,0,0-5.66,13.66l24,24a8,8,0,0,0,11.32,0l24-24A8,8,0,0,0,255.39,124.94Z" />
      </svg>
    ),

    heading: 'Choose Agents',
    description:
      'Pick from a library of ready-to-use AI agents tailored for specific business workflows.',
    image:
      'https://framerusercontent.com/images/YgWRrtG93V1McwqDupyqVXTGkI.jpg',
  },
  {
    id: '02',
    label: 'Connect Tools',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M88.57,35A8,8,0,0,1,103.43,29l8,20A8,8,0,0,1,96.57,55ZM29,103.43l20,8A8,8,0,1,0,55,96.57l-20-8A8,8,0,0,0,29,103.43ZM227,152.57l-20-8A8,8,0,1,0,201,159.43l20,8A8,8,0,0,0,227,152.57ZM159.43,201A8,8,0,0,0,144.57,207l8,20A8,8,0,1,0,167.43,221ZM237.91,18.52a8,8,0,0,0-11.5-.18L174,70.75l-5.38-5.38a32,32,0,0,0-45.28,0L106.14,82.54a4,4,0,0,0,0,5.66l61.7,61.66a4,4,0,0,0,5.66,0l16.74-16.74a32.76,32.76,0,0,0,9.81-22.52,31.82,31.82,0,0,0-9.37-23.17l-5.38-5.37,52.2-52.17A8.22,8.22,0,0,0,237.91,18.52ZM85.64,90.34a8,8,0,0,0-11.49.18,8.22,8.22,0,0,0,.41,11.37L80.67,108,65.34,123.31A31.82,31.82,0,0,0,56,146.47,32.75,32.75,0,0,0,65.77,169l5,4.94L18.49,226.13a8.21,8.21,0,0,0-.61,11.1,8,8,0,0,0,11.72.43L82,185.25l5.37,5.38a32.1,32.1,0,0,0,45.29,0L148,175.31l6.34,6.35a8,8,0,0,0,11.32-11.32Z" />
      </svg>
    ),

    heading: 'Connect Tools',
    description:
      'Integrate with your existing tools and platforms in just a few clicks — no technical setup required.',
    image:
      'https://framerusercontent.com/images/YgWRrtG93V1McwqDupyqVXTGkI.jpg',
  },
  {
    id: '03',
    label: 'Automate Tasks',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M104,64A32,32,0,1,0,64,95v66a32,32,0,1,0,16,0V95A32.06,32.06,0,0,0,104,64ZM88,192a16,16,0,1,1-16-16A16,16,0,0,1,88,192Zm144,0a32,32,0,1,1-40-31V110.63a8,8,0,0,0-2.34-5.66L152,67.31V96a8,8,0,0,1-16,0V48a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H163.31L201,93.66a23.85,23.85,0,0,1,7,17V161A32.06,32.06,0,0,1,232,192Z" />
      </svg>
    ),

    heading: 'Automate Tasks',
    description:
      'Let your agents run automatically in the background, handling repetitive tasks while you focus on what matters.',
    image:
      'https://framerusercontent.com/images/YgWRrtG93V1McwqDupyqVXTGkI.jpg',
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      className="w-full flex flex-col items-center"
      id="how-it-works"
      style={{ padding: '64px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">EASY ONBOARDING</span>
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
              How it works?
            </h2>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            boxShadow: 'rgba(0,0,0,0.05) 0px 2px 2px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Tab Buttons */}
          <div
            className="flex items-center relative"
            style={{
              borderBottom: '1px solid rgb(233,235,239)',
              backgroundColor: '#ffffff',
              padding: '12px',
            }}
          >
            {steps?.map((step, i) => (
              <button
                key={step?.id}
                onClick={() => setActiveStep(i)}
                className="flex items-center gap-2.5 flex-1 px-5 py-5 relative z-10 transition-colors"
                style={{
                  color: activeStep === i ? '#000000' : 'rgb(78,91,109)',
                }}
              >
                <span style={{ color: 'inherit' }}>{step?.icon}</span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {step?.label}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'inherit',
                    textAlign: 'right',
                  }}
                >
                  {step?.id}
                </span>
              </button>
            ))}
            {/* Active indicator */}
            <div
              className="absolute bottom-2 transition-all duration-300"
              style={{
                left: `calc(${activeStep * 33.33}% + 8px)`,
                width: 'calc(33.33% - 16px)',
                height: '67px',
                backgroundColor: 'rgb(233,235,239)',
                borderRadius: '16px',
                zIndex: 0,
              }}
            />
          </div>

          {/* Content */}
          <div className="flex items-start gap-12" style={{ padding: '48px' }}>
            {/* Text */}
            <div className="flex flex-col gap-4 flex-1 max-w-[400px]">
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 600,
                  color: 'rgb(209,213,221)',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1em',
                }}
              >
                {steps?.[activeStep]?.id}.
              </p>
              <h3
                style={{
                  fontSize: '36px',
                  fontWeight: 600,
                  color: '#000000',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1em',
                }}
              >
                {steps?.[activeStep]?.heading}
              </h3>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.7)',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.5em',
                }}
              >
                {steps?.[activeStep]?.description}
              </p>
              <a
                href="#"
                className="btn-dark"
                style={{
                  width: 'fit-content',
                  padding: '14px 20px',
                  marginTop: '8px',
                }}
              >
                Get Started
              </a>
            </div>

            {/* Image */}
            <div
              className="flex-1 hidden md:block"
              style={{
                height: '349px',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={steps?.[activeStep]?.image}
                alt={steps?.[activeStep]?.heading}
                width={1052}
                height={349}
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
      </div>
    </section>
  );
}
