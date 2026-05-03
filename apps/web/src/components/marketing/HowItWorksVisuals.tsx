'use client';
import React from 'react';

/* --- Step 1: Recording in Progress ---------------------------- */
export const Step1Visual = () => (
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
        { a: 'step1_bar1', d: '0s' },
        { a: 'step1_bar2', d: '0.1s' },
        { a: 'step1_bar3', d: '0.2s' },
        { a: 'step1_bar4', d: '0.3s' },
        { a: 'step1_bar5', d: '0.4s' },
        { a: 'step1_bar6', d: '0.5s' },
        { a: 'step1_bar7', d: '0.3s' },
        { a: 'step1_bar8', d: '0.15s' },
        { a: 'step1_bar9', d: '0.25s' },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            borderRadius: '3px',
            background: '#37ea9e',
            opacity: 0.8,
            animation: `${b.a} 0.9s ease-in-out infinite ${b.d}`,
          }}
        />
      ))}
    </div>

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
export const Step2Visual = () => (
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
        0%,14%{opacity:0;transform:translateY(6px)} 22%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_item2 {
        0%,24%{opacity:0;transform:translateY(6px)} 32%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_item3 {
        0%,34%{opacity:0;transform:translateY(6px)} 42%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_actions {
        0%,44%{opacity:0;transform:translateY(6px)} 52%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_chk1 {
        0%,54%{opacity:0;transform:translateY(4px)} 62%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_chk2 {
        0%,62%{opacity:0;transform:translateY(4px)} 70%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
      }
      @keyframes step2_chk3 {
        0%,70%{opacity:0;transform:translateY(4px)} 78%{opacity:1;transform:translateY(0)}
        82%{opacity:1} 90%,100%{opacity:0}
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
export const Step3Visual = () => (
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
        0%,5%{opacity:0;transform:translateX(10px)} 15%,70%{opacity:1;transform:translateX(0)} 80%,100%{opacity:0}
      }
      @keyframes step3_dot {
        0%,20%{opacity:0} 25%,45%{opacity:1} 52%,100%{opacity:0}
      }
      @keyframes step3_bounce {
        0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
      }
      @keyframes step3_ans {
        0%,40%{opacity:0;transform:translateX(-8px)} 52%,70%{opacity:1;transform:translateX(0)} 80%,100%{opacity:0}
      }
      @keyframes step3_chip {
        0%,56%{opacity:0;transform:translateY(4px)} 65%,70%{opacity:1;transform:translateY(0)} 80%,100%{opacity:0}
      }
    `}</style>

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
