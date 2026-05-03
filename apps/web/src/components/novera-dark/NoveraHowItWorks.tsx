'use client';
import React, { useState, useEffect, useRef } from 'react';

const KF = `
@keyframes ms-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ms-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes ms-dot{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}
@keyframes ms-appear{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`;

// ── Icons ──────────────────────────────────────────────────────────────────────

const Ic = ({
  c = '#4a9b6a',
  s = 16,
  children,
}: {
  c?: string;
  s?: number;
  children: React.ReactNode;
}) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke={c}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const VideoIcon = ({ c = '#4a9b6a', s = 16 }) => (
  <Ic c={c} s={s}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </Ic>
);
const MicIcon = ({ c = '#4a9b6a', s = 16 }) => (
  <Ic c={c} s={s}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </Ic>
);
const CalendarIcon = ({ c = '#4a9b6a', s = 16 }) => (
  <Ic c={c} s={s}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ic>
);
const UsersIcon = ({ c = '#2d7a52', s = 15 }) => (
  <Ic c={c} s={s}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Ic>
);
const ClockIcon = ({ c = '#2d7a52', s = 15 }) => (
  <Ic c={c} s={s}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Ic>
);
const MsgIcon = ({ c = '#2d7a52', s = 15 }) => (
  <Ic c={c} s={s}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Ic>
);
const PhoneIcon = ({ c = '#2d7a52', s = 15 }) => (
  <Ic c={c} s={s}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13.12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
  </Ic>
);

// ── Step 1: Meeting Orbit ──────────────────────────────────────────────────────

const INNER_R = 65;
const OUTER_R = 100;

const innerIcons = [
  { angle: 0, el: <VideoIcon /> },
  { angle: 120, el: <MicIcon /> },
  { angle: 240, el: <CalendarIcon /> },
];
const outerIcons = [
  { angle: 20, el: <UsersIcon /> },
  { angle: 110, el: <ClockIcon /> },
  { angle: 200, el: <MsgIcon /> },
  { angle: 290, el: <PhoneIcon /> },
];

function IconBubble({
  angle,
  r,
  dur,
  icon,
  cw,
}: {
  angle: number;
  r: number;
  dur: number;
  icon: React.ReactNode;
  cw: boolean;
}) {
  return (
    // 1. anchor point on the ring
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        transform: `rotate(${angle}deg) translateX(${r}px)`,
      }}
    >
      {/* 2. center the bubble on that point — never touched by animation */}
      <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)' }}>
        {/* 3. counter-rotate to keep icon upright */}
        <div
          style={{
            animation: `${cw ? 'ms-cw' : 'ms-ccw'} ${dur}s linear infinite`,
            background: '#fff',
            border: '1px solid rgba(26,107,66,0.18)',
            borderRadius: '9px',
            padding: '6px',
            display: 'flex',
            boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function MeetingOrbit() {
  return (
    <div
      style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '90px',
          height: '90px',
          transform: 'translate(-50%,-50%)',
          background:
            'radial-gradient(circle, rgba(26,107,66,0.22) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '50px',
          height: '50px',
          transform: 'translate(-50%,-50%)',
          background: 'linear-gradient(135deg,#1a6b42,#0f3d26)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 18px rgba(26,107,66,0.45)',
          zIndex: 10,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#d9f0e5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${INNER_R * 2}px`,
          height: `${INNER_R * 2}px`,
          marginLeft: `-${INNER_R}px`,
          marginTop: `-${INNER_R}px`,
          border: '1px solid rgba(26,107,66,0.38)',
          borderRadius: '50%',
          animation: 'ms-cw 14s linear infinite',
        }}
      >
        {innerIcons.map(({ angle, el }, i) => (
          <IconBubble
            key={i}
            angle={angle}
            r={INNER_R}
            dur={14}
            icon={el}
            cw={false}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${OUTER_R * 2}px`,
          height: `${OUTER_R * 2}px`,
          marginLeft: `-${OUTER_R}px`,
          marginTop: `-${OUTER_R}px`,
          border: '1px dashed rgba(26,107,66,0.2)',
          borderRadius: '50%',
          animation: 'ms-ccw 22s linear infinite',
        }}
      >
        {outerIcons.map(({ angle, el }, i) => (
          <IconBubble
            key={i}
            angle={angle}
            r={OUTER_R}
            dur={22}
            icon={el}
            cw={true}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Brief Ready ────────────────────────────────────────────────────────

const PILL = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '11px',
  color: '#4a9b6a',
  background: 'rgba(26,107,66,0.12)',
  border: '1px solid rgba(26,107,66,0.25)',
  borderRadius: '6px',
  padding: '3px 8px',
};
const BRIEF_STATES = [
  {
    label: 'Session Summary',
    render: () => (
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: '#4a5550',
          lineHeight: '1.6em',
          margin: 0,
        }}
      >
        Client explored delegation challenges and identified key insights about
        team dynamics. Focus shifted toward building trust and letting go of
        control.
      </p>
    ),
  },
  {
    label: 'Key Topics',
    render: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {[
          'delegation',
          'trust',
          'leadership',
          'self-awareness',
          'team dynamics',
        ].map(t => (
          <span key={t} style={PILL}>
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: 'Action Items',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {[
          { done: true, text: 'Prepare open questions for 1:1s' },
          { done: true, text: 'Reflect on specific instances of trust' },
          { done: false, text: 'Journal about delegation success' },
        ].map((item, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                border: `1px solid ${item.done ? '#1a6b42' : 'rgba(26,107,66,0.3)'}`,
                borderRadius: '4px',
                background: item.done ? '#1a6b42' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.done && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path
                    d="M1 3.5L3.2 5.8L8 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                color: item.done ? '#7aab90' : '#3a4a40',
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

function BriefReady() {
  const [idx, setIdx] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setIdx(i => (i + 1) % BRIEF_STATES.length);
        setOpacity(1);
      }, 380);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const s = BRIEF_STATES[idx];
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px',
        padding: '16px',
        height: '180px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#1a6b42',
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: '#1a6b42',
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
          }}
        >
          {s.label}
        </span>
      </div>
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />
      <div style={{ flex: 1, opacity, transition: 'opacity 0.35s ease' }}>
        {s.render()}
      </div>
    </div>
  );
}

// ── Step 3: Solis Chat ─────────────────────────────────────────────────────────

const CHAT = [
  { role: 'user', text: 'What has Sarah been working on lately?' },
  {
    role: 'ai',
    text: "Sarah has focused on delegation and building trust with her direct reports. Key themes from her last 3 sessions: leadership anxiety, letting go of control, and managing expectations. She's making real progress.",
  },
  { role: 'user', text: 'Who needs follow-up this week?' },
  {
    role: 'ai',
    text: "Marcus hasn't had a session in 30 days and has 3 open action items — one flagged urgent. Sarah also has 2 pending. I'd prioritise Marcus first.",
  },
];

function TypingDots() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: '10px',
        width: 'fit-content',
        animation: 'ms-appear 0.3s ease both',
      }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#1a6b42',
            animation: `ms-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

function SolisChat() {
  const [shown, setShown] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setShown([]);
      setTyping(false);
      setFadeOut(false);
      ts.push(setTimeout(() => setShown([0]), 600));
      ts.push(setTimeout(() => setTyping(true), 1400));
      ts.push(
        setTimeout(() => {
          setTyping(false);
          setShown([0, 1]);
        }, 3400)
      );
      ts.push(setTimeout(() => setShown([0, 1, 2]), 5000));
      ts.push(setTimeout(() => setTyping(true), 5800));
      ts.push(
        setTimeout(() => {
          setTyping(false);
          setShown([0, 1, 2, 3]);
        }, 8200)
      );
      ts.push(setTimeout(() => setFadeOut(true), 11000));
      ts.push(setTimeout(run, 12500));
    };
    run();
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [shown, typing]);

  return (
    <div
      ref={ref}
      style={{
        height: '200px',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.9s ease',
      }}
    >
      {CHAT.map((msg, i) =>
        !shown.includes(i) ? null : (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'ms-appear 0.4s ease both',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                maxWidth: '88%',
                padding: '8px 12px',
                borderRadius:
                  msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                background: msg.role === 'user' ? '#1a6b42' : '#fff',
                border:
                  msg.role === 'ai' ? '1px solid rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                color: msg.role === 'user' ? '#d9f0e5' : '#3a4a40',
                lineHeight: '1.55em',
                boxShadow:
                  msg.role === 'ai'
                    ? '0 2px 8px rgba(0,0,0,0.07)'
                    : '0 2px 8px rgba(26,107,66,0.2)',
              }}
            >
              {msg.text}
            </div>
          </div>
        )
      )}
      {typing && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            flexShrink: 0,
          }}
        >
          <TypingDots />
        </div>
      )}
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Finish Your Meeting',
    description:
      "That's it. MeetSolis connects automatically — no uploading, no extra steps. Just meet with your client like you always do.",
    component: <MeetingOrbit />,
  },
  {
    num: '02',
    title: 'Your Brief Is Ready',
    description:
      'A full session summary, key topics, breakthroughs, and action items — all generated automatically before you close your laptop.',
    component: <BriefReady />,
  },
  {
    num: '03',
    title: 'Ask Solis Anything',
    description:
      "Never lose track of what matters. Ask Solis what your client committed to, where they got stuck, and what shifted — across every conversation you've ever had.",
    component: <SolisChat />,
  },
];

export default function NoveraHowItWorks() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <style>{KF}</style>
      <div className="max-w-[1248px] mx-auto px-6 py-12 pb-32">
        <div className="flex flex-col gap-4 max-w-[480px] mb-12">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2 rounded-full"
              style={{ backgroundColor: '#1a6b42' }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#b8c5bf',
              }}
            >
              How It Works
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Petrona, serif',
              fontSize: 'clamp(32px, 3.5vw, 40px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: '1.1em',
              color: '#d9f0e5',
              margin: 0,
            }}
          >
            Set it up once. Get value after every session.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              lineHeight: '1.4em',
              color: '#b8c5bf',
              margin: 0,
            }}
          >
            No new habits. No manual steps. Works quietly in the background and
            surfaces everything you need.
          </p>
        </div>
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.7s ease, transform 0.7s ease`,
                transitionDelay: `${i * 0.15}s`,
                background: '#f0ede6',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1a6b42',
                  letterSpacing: '0.1em',
                }}
              >
                {step.num}
              </span>
              <div
                style={{
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.component}
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <p
                  style={{
                    fontFamily: 'Petrona, serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: '#0d1410',
                    margin: 0,
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.55em',
                    color: '#5a6a60',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
