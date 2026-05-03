'use client';
import React, { useState } from 'react';

/* --- Step 1: Recording in Progress ---------------------------- */
const Step1Visual = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes step1_pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(55,234,158,0.5); }
        50% { box-shadow: 0 0 0 8px rgba(55,234,158,0); }
      }
      @keyframes step1_pulse_blue {
        0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.5); }
        50% { box-shadow: 0 0 0 8px rgba(96,165,250,0); }
      }
      @keyframes step1_blink {
        0%, 45%, 100% { opacity: 1; }
        50%, 95% { opacity: 0; }
      }
      @keyframes step1_bar1 { 0%,100%{height:8px} 50%{height:28px} }
      @keyframes step1_bar2 { 0%,100%{height:18px} 50%{height:6px} }
      @keyframes step1_bar3 { 0%,100%{height:24px} 50%{height:10px} }
      @keyframes step1_bar4 { 0%,100%{height:10px} 50%{height:32px} }
      @keyframes step1_bar5 { 0%,100%{height:30px} 50%{height:12px} }
      @keyframes step1_bar6 { 0%,100%{height:14px} 50%{height:26px} }
      @keyframes step1_bar7 { 0%,100%{height:22px} 50%{height:8px} }
      @keyframes step1_bar8 { 0%,100%{height:8px} 50%{height:20px} }
      @keyframes step1_bar9 { 0%,100%{height:18px} 50%{height:34px} }
    `}</style>

    {/* REC badge */}
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
          animation: 'step1_blink 1.5s ease-in-out infinite',
          display: 'inline-block',
        }}
      />
      REC
    </div>

    {/* Avatars */}
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      {/* Coach */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(55,234,158,0.15)',
            border: '2px solid #37ea9e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#37ea9e',
            animation: 'step1_pulse 2s ease-in-out infinite',
          }}
        >
          C
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.02em',
          }}
        >
          Coach
        </span>
      </div>

      {/* Client */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(96,165,250,0.15)',
            border: '2px solid #60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#60a5fa',
            animation: 'step1_pulse_blue 2s ease-in-out infinite 0.7s',
          }}
        >
          JM
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.02em',
          }}
        >
          Client
        </span>
      </div>
    </div>

    {/* Waveform */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        height: '40px',
      }}
    >
      {[
        { anim: 'step1_bar1', delay: '0s' },
        { anim: 'step1_bar2', delay: '0.1s' },
        { anim: 'step1_bar3', delay: '0.2s' },
        { anim: 'step1_bar4', delay: '0.3s' },
        { anim: 'step1_bar5', delay: '0.4s' },
        { anim: 'step1_bar6', delay: '0.5s' },
        { anim: 'step1_bar7', delay: '0.3s' },
        { anim: 'step1_bar8', delay: '0.15s' },
        { anim: 'step1_bar9', delay: '0.25s' },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            borderRadius: '3px',
            background: '#37ea9e',
            opacity: 0.8,
            animation: `${b.anim} 0.9s ease-in-out infinite ${b.delay}`,
          }}
        />
      ))}
    </div>

    {/* Label */}
    <span
      style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.03em',
      }}
    >
      Session recording…
    </span>
  </div>
);

/* --- Step 2: AI Writes the Notes ------------------------------ */
const Step2Visual = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes step2_cycle {
        0%   { opacity: 0; transform: translateY(6px); }
        8%   { opacity: 1; transform: translateY(0); }
        82%  { opacity: 1; transform: translateY(0); }
        90%  { opacity: 0; transform: translateY(-4px); }
        100% { opacity: 0; }
      }
      @keyframes step2_item1 {
        0%,14%  { opacity: 0; transform: translateY(6px); }
        22%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_item2 {
        0%,24%  { opacity: 0; transform: translateY(6px); }
        32%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_item3 {
        0%,34%  { opacity: 0; transform: translateY(6px); }
        42%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_actions {
        0%,44%  { opacity: 0; transform: translateY(6px); }
        52%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_chk1 {
        0%,54%  { opacity: 0; transform: translateY(4px); }
        62%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_chk2 {
        0%,62%  { opacity: 0; transform: translateY(4px); }
        70%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
      @keyframes step2_chk3 {
        0%,70%  { opacity: 0; transform: translateY(4px); }
        78%     { opacity: 1; transform: translateY(0); }
        82%     { opacity: 1; }
        90%,100%{ opacity: 0; }
      }
    `}</style>

    <div
      style={{
        width: '100%',
        background: 'rgb(22,26,32)',
        borderRadius: '12px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Title */}
      <div style={{ animation: 'step2_cycle 5s ease-in-out infinite' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#37ea9e',
            letterSpacing: '0.02em',
          }}
        >
          Session Summary
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            marginLeft: '6px',
          }}
        >
          — Marcus Chen
        </span>
      </div>

      {/* Bullet points */}
      {[
        {
          text: 'Explored fears around the upcoming board review',
          anim: 'step2_item1',
        },
        {
          text: 'Identified pattern of avoidance in high-stakes conversations',
          anim: 'step2_item2',
        },
        {
          text: 'Agreed on reframing leadership as service, not performance',
          anim: 'step2_item3',
        },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            animation: `${item.anim} 5s ease-in-out infinite`,
          }}
        >
          <span
            style={{
              color: '#37ea9e',
              fontSize: '12px',
              marginTop: '1px',
              flexShrink: 0,
            }}
          >
            •
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.4',
            }}
          >
            {item.text}
          </span>
        </div>
      ))}

      {/* Divider + Action Items */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '10px',
          animation: 'step2_actions 5s ease-in-out infinite',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Action Items
        </span>
      </div>

      {/* Checkboxes */}
      {[
        { text: 'Draft 3-min board opening statement', anim: 'step2_chk1' },
        { text: 'Rehearse with Sarah before Friday', anim: 'step2_chk2' },
        { text: 'Journal: what does "ready" feel like?', anim: 'step2_chk3' },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: `${item.anim} 5s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '3px',
              background: 'rgba(55,234,158,0.2)',
              border: '1.5px solid #37ea9e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path
                d="M1 3L3 5L7 1"
                stroke="#37ea9e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* --- Step 3: Ask Anything (Solis chat) ------------------------ */
const Step3Visual = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '12px',
      padding: '28px 24px',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes step3_q {
        0%,5%   { opacity: 0; transform: translateX(10px); }
        15%,70% { opacity: 1; transform: translateX(0); }
        80%,100%{ opacity: 0; }
      }
      @keyframes step3_dot {
        0%,20%  { opacity: 0; }
        25%,45% { opacity: 1; }
        52%,100%{ opacity: 0; }
      }
      @keyframes step3_bounce {
        0%,100%{ transform: translateY(0); }
        50%    { transform: translateY(-4px); }
      }
      @keyframes step3_ans {
        0%,40%  { opacity: 0; transform: translateX(-8px); }
        52%,70% { opacity: 1; transform: translateX(0); }
        80%,100%{ opacity: 0; }
      }
      @keyframes step3_chip {
        0%,56%  { opacity: 0; transform: translateY(4px); }
        65%,70% { opacity: 1; transform: translateY(0); }
        80%,100%{ opacity: 0; }
      }
    `}</style>

    {/* User question (right) */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'step3_q 6s ease-in-out infinite',
      }}
    >
      <div
        style={{
          background: 'rgba(55,234,158,0.15)',
          border: '1px solid rgba(55,234,158,0.3)',
          borderRadius: '14px 14px 2px 14px',
          padding: '10px 14px',
          maxWidth: '78%',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: '1.45',
        }}
      >
        What did Marcus say about the board meeting?
      </div>
    </div>

    {/* Thinking dots (left) */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        animation: 'step3_dot 6s ease-in-out infinite',
      }}
    >
      <div
        style={{
          background: 'rgb(22,26,32)',
          borderRadius: '14px 14px 14px 2px',
          padding: '10px 16px',
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
        }}
      >
        {[0, 0.18, 0.36].map((delay, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#37ea9e',
              animation: `step3_bounce 0.7s ease-in-out infinite ${delay}s`,
            }}
          />
        ))}
      </div>
    </div>

    {/* AI answer (left) */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: 'step3_ans 6s ease-in-out infinite',
      }}
    >
      <div
        style={{
          background: 'rgb(22,26,32)',
          borderRadius: '14px 14px 14px 2px',
          padding: '12px 14px',
          maxWidth: '88%',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: '1.5',
        }}
      >
        Marcus felt underprepared. He committed to rehearsing with Sarah before
        the next meeting.
      </div>
      {/* Citation chip */}
      <div
        style={{
          animation: 'step3_chip 6s ease-in-out infinite',
          display: 'inline-flex',
          alignSelf: 'flex-start',
        }}
      >
        <span
          style={{
            background: 'rgba(55,234,158,0.12)',
            border: '1px solid rgba(55,234,158,0.35)',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
            color: '#37ea9e',
            fontWeight: 500,
          }}
        >
          ↳ Jan 22 session
        </span>
      </div>
    </div>
  </div>
);

/* --- Steps data ----------------------------------------------- */
const steps = [
  {
    id: '01',
    label: 'Just Coach',
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
    heading: 'Just Coach',
    description:
      'Run your session on any video platform. MeetSolis silently captures and transcribes the conversation — you stay present, we handle the rest.',
    visual: <Step1Visual />,
  },
  {
    id: '02',
    label: 'AI Writes the Notes',
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
    heading: 'AI Writes the Notes',
    description:
      'Instant summary, action items, and key discussion points — generated the moment your session ends. No note-taking. No admin work.',
    visual: <Step2Visual />,
  },
  {
    id: '03',
    label: 'Ask Anything',
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
    heading: 'Ask Anything',
    description:
      'Before your next session, ask Solis: "What did Marcus say about his relationship with the board?" — cited answers from months of sessions in seconds.',
    visual: <Step3Visual />,
  },
];

/* --- Section -------------------------------------------------- */
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16"
      id="how-it-works"
      style={{ backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">
              FOR CLIENT-FACING PROFESSIONALS
            </span>
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
            className="flex items-center relative overflow-x-auto"
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
                className="flex items-center gap-2 flex-1 px-3 py-4 sm:px-5 sm:py-5 relative z-10 transition-colors min-w-0"
                style={{
                  color: activeStep === i ? '#000000' : 'rgb(78,91,109)',
                }}
              >
                <span style={{ color: 'inherit', flexShrink: 0 }}>
                  {step?.icon}
                </span>
                <span
                  className="hidden sm:block"
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    flex: 1,
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step?.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'inherit',
                    textAlign: 'right',
                    flexShrink: 0,
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
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 p-6 sm:p-8 md:p-12">
            {/* Text */}
            <div className="flex flex-col gap-4 w-full md:flex-1 md:max-w-[400px]">
              <p
                style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
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
                  fontSize: 'clamp(24px, 4vw, 36px)',
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

            {/* Visual */}
            <div
              className="flex-1 hidden md:block"
              style={{
                height: '349px',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {steps?.[activeStep]?.visual}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
