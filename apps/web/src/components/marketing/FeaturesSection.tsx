'use client';
import React from 'react';

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104a88,88,0,0,1,176,0Z" />
      </svg>
    ),
    title: 'Works with Any Video Platform',
    description:
      'Use Zoom, Google Meet, Microsoft Teams, or any other tool. Record your session anywhere, upload to MeetSolis — no new apps required.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
      </svg>
    ),
    title: 'Automatic Action Item Extraction',
    description:
      'Every client commitment, follow-up, and next step is automatically pulled from the transcript. No coaching session goes unaccounted for.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M245.48,125.57c-19.85-42.6-64.85-70.07-117.48-70.07S30.37,83,10.52,125.57a8,8,0,0,0,0,4.86C30.37,173,75.37,200.5,128,200.5s97.63-27.47,117.48-70.07A8,8,0,0,0,245.48,125.57ZM128,184.5c-44.17,0-82.81-21.87-100.06-56.5C45.19,93.37,83.83,71.5,128,71.5s82.81,21.87,100.06,56.5C210.81,162.63,172.17,184.5,128,184.5Zm0-112a40,40,0,1,0,40,40A40,40,0,0,0,128,72.5Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,136.5Z" />
      </svg>
    ),
    title: 'Speaker-Aware Coaching Transcripts',
    description:
      'AI automatically separates coach and client voices in every transcript. Instantly see who said what — no manual labeling needed.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-40-96a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h48A8,8,0,0,1,160,120Zm0,32a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h48A8,8,0,0,1,160,152Zm0,32a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h48A8,8,0,0,1,160,184Z" />
      </svg>
    ),
    title: 'Flexible Transcript Upload',
    description:
      'Paste plain text, upload a .txt or .docx file, or drop an audio/video recording. MeetSolis processes any format into structured coaching notes.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M208,40H48A16,16,0,0,0,32,56V216a8,8,0,0,0,13,6.22L128,163.28l83,58.94A8,8,0,0,0,224,216V56A16,16,0,0,0,208,40Z" />
      </svg>
    ),
    title: 'Private by Design — Your Clients\u2019 Data Is Never Shared',
    description:
      'Client conversations are confidential. MeetSolis never uses your session data to train AI models. Your clients\u2019 breakthroughs stay between you.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M229.66,218.34l-50.07-50.07a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
      </svg>
    ),
    title: 'Full-Text Search Across All Sessions',
    description:
      'Instantly search every transcript, summary, and note across all clients. Find any insight, quote, or decision from any session in seconds.',
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16"
      id="core-value"
      style={{ backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">EVERYTHING YOU NEED</span>
            <div className="text-center">
              <h2
                style={{
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  fontWeight: 600,
                  letterSpacing: 'clamp(-1px, -0.4vw, -3px)',
                  lineHeight: '1em',
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                The details that make
              </h2>
              <h2
                style={{
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  fontWeight: 600,
                  letterSpacing: 'clamp(-1px, -0.4vw, -3px)',
                  lineHeight: '1em',
                  color: '#000000',
                  textAlign: 'center',
                }}
              >
                the difference
              </h2>
            </div>
          </div>
        </div>

        {/* Features Strip List */}
        <div
          className="w-full"
          style={{
            border: '1px solid rgb(228,228,228)',
            borderRadius: '20px',
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="group/row flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[rgb(250,251,252)] transition-colors cursor-default"
              style={{
                padding: '16px 20px',
                borderBottom:
                  i < features.length - 1
                    ? '1px solid rgb(233,235,239)'
                    : 'none',
              }}
            >
              {/* Icon box */}
              <div
                className="shrink-0 [&_svg]:w-5 [&_svg]:h-5"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(55,234,158,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgb(55,234,158)',
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h5
                className="shrink-0"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000',
                  lineHeight: '1.3',
                  minWidth: '220px',
                  margin: 0,
                }}
              >
                {feature.title}
              </h5>

              {/* Description */}
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(0,0,0,0.6)',
                  lineHeight: '1.5',
                  flex: 1,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
