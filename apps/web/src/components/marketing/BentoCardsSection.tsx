'use client';
import React from 'react';
import Image from 'next/image';

const GREEN = 'rgb(55,234,158)';
const GREEN_DIM = 'rgba(55,234,158,0.4)';
const WHITE_MUTED = 'rgba(255,255,255,0.5)';
const CARD_BG = 'rgba(26,29,33,0.96)';

const clients = [
  {
    initials: 'MC',
    name: 'Marcus Chen',
    lastSeen: '2 days ago',
    sessions: 3,
    avatarBg: GREEN,
    avatarColor: '#000',
    overdue: false,
  },
  {
    initials: 'SK',
    name: 'Sarah Kim',
    lastSeen: '5 days ago',
    sessions: 7,
    avatarBg: 'rgb(59,130,246)',
    avatarColor: '#fff',
    overdue: false,
  },
  {
    initials: 'DP',
    name: 'David Park',
    lastSeen: '12 days ago',
    sessions: 2,
    avatarBg: 'rgb(139,92,246)',
    avatarColor: '#fff',
    overdue: true,
  },
];

const timelineEntries = [
  {
    date: 'Jan 15',
    title: 'Breakthrough: leadership identity',
    highlight: false,
  },
  { date: 'Jan 29', title: 'Goal: reduce overwhelm', highlight: false },
  {
    date: 'Feb 12',
    title: 'Committed to exec coach training',
    highlight: false,
  },
  { date: 'Feb 26', title: 'Board presentation prep', highlight: true },
];

const avatarImgs = [
  'https://framerusercontent.com/images/qT2RDznEpOrJtcHZv3nDznB7QOk.jpg',
  'https://framerusercontent.com/images/lTKrFGv3E8wzq6LqHhJddpV1vE.jpg',
  'https://framerusercontent.com/images/6NveBVCzvNa67ChHcDODa017M.jpg',
  'https://framerusercontent.com/images/05knyzw0rUgULM6deRVbL10UAw.jpg',
];

export default function BentoCardsSection() {
  return (
    <section
      className="w-full flex flex-col items-center px-4 py-10 sm:px-8 md:px-16"
      style={{ backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-3">
        {/* Left Card: Client Profiles */}
        <div
          className="flex flex-col gap-4 rounded-[20px] overflow-hidden w-full md:w-[300px]"
          style={{
            backgroundColor: '#000',
            minHeight: '400px',
            padding: '36px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: CARD_BG,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#fff',
                  lineHeight: '1em',
                }}
              >
                Every client. Every session. Never forgotten.
              </h4>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: WHITE_MUTED,
                  marginTop: '8px',
                  lineHeight: '1.5em',
                }}
              >
                Persistent client profiles that grow richer with every coaching
                session.
              </p>
            </div>

            {/* Client rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {clients.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom:
                      i < clients.length - 1
                        ? '1px solid rgba(255,255,255,0.06)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: c.avatarBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: c.avatarColor,
                    }}
                  >
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.name}
                      </span>
                      {c.overdue && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'rgb(251,191,36)',
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Last: {c.lastSeen}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: GREEN,
                      backgroundColor: 'rgba(55,234,158,0.1)',
                      border: '1px solid rgba(55,234,158,0.2)',
                      borderRadius: '20px',
                      padding: '3px 10px',
                      flexShrink: 0,
                    }}
                  >
                    {c.sessions} sessions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Cards */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* AI Summaries Card */}
            <div
              className="flex-1 rounded-[20px] overflow-hidden relative"
              style={{
                border: '1px solid rgb(228,228,228)',
                backgroundColor: '#fff',
                minHeight: '286px',
              }}
            >
              <div
                style={{
                  background:
                    'linear-gradient(117.06deg, rgb(22,167,129) 0%, rgb(106,235,201) 100%)',
                  padding: '36px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  {avatarImgs.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '100%',
                        border: '2px solid rgb(22,167,129)',
                        overflow: 'hidden',
                        marginLeft: i === 0 ? 0 : '-12px',
                        zIndex: i,
                        position: 'relative',
                      }}
                    >
                      <Image
                        src={img}
                        alt=""
                        width={32}
                        height={32}
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgb(10,77,59)',
                    letterSpacing: '0.12em',
                  }}
                >
                  AI SUMMARIES
                </p>
                <h4
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#000',
                    lineHeight: '1em',
                  }}
                >
                  Session done. Notes written. Instantly.
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgb(10,77,59)',
                  }}
                >
                  Zero note-taking. Ever.
                </p>
              </div>
            </div>

            {/* Timeline Card */}
            <div
              className="flex-1 rounded-[20px] overflow-hidden relative"
              style={{
                backgroundColor: '#000',
                minHeight: '286px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: '28px 24px 80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {timelineEntries.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0,
                        width: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          marginTop: '3px',
                          flexShrink: 0,
                          backgroundColor: e.highlight ? GREEN : GREEN_DIM,
                          border: `2px solid ${e.highlight ? 'rgba(55,234,158,0.6)' : 'rgba(55,234,158,0.2)'}`,
                          boxShadow: e.highlight
                            ? '0 0 8px rgba(55,234,158,0.5)'
                            : 'none',
                        }}
                      />
                      {i < timelineEntries.length - 1 && (
                        <div
                          style={{
                            width: '1px',
                            flex: 1,
                            minHeight: '28px',
                            backgroundColor: 'rgba(55,234,158,0.15)',
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        paddingBottom:
                          i < timelineEntries.length - 1 ? '20px' : '0',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: GREEN,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {e.date}
                      </span>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: e.highlight ? 600 : 400,
                          color: e.highlight
                            ? '#fff'
                            : 'rgba(255,255,255,0.55)',
                          marginTop: '2px',
                          lineHeight: '1.3em',
                        }}
                      >
                        {e.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '36px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)',
                }}
              >
                <h4
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'rgb(241,254,248)',
                    lineHeight: '1em',
                  }}
                >
                  Session Timeline
                </h4>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'rgba(241,254,248,0.7)',
                    marginTop: '4px',
                  }}
                >
                  Every breakthrough organized.
                </p>
              </div>
            </div>
          </div>

          {/* Solis Intelligence Card */}
          <div
            className="rounded-[20px] overflow-hidden flex flex-col sm:flex-row"
            style={{
              border: '1px solid rgb(228,228,228)',
              backgroundColor: '#000',
              flex: 1,
            }}
          >
            <div
              className="flex flex-col gap-4 p-6 sm:p-9 border-b sm:border-b-0 sm:border-r"
              style={{ flex: '0 0 auto', borderColor: '#131619' }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgb(106,235,201)',
                  letterSpacing: '0.1em',
                  marginBottom: '4px',
                }}
              >
                SOLIS INTELLIGENCE
              </p>
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#fff',
                  lineHeight: '1.1em',
                }}
              >
                Your clients&apos; history. One question away.
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: '1.5em',
                }}
              >
                Ask anything. Get cited answers from every session.
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <div
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: '20px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Chat header */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: 'rgb(106,235,201)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#000',
                      }}
                    >
                      ✦
                    </span>
                  </div>
                  <span
                    style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}
                  >
                    Solis
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'rgb(106,235,201)',
                      backgroundColor: 'rgba(106,235,201,0.1)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      marginLeft: 'auto',
                    }}
                  >
                    Marcus Chen
                  </span>
                </div>
                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    overflowY: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        backgroundColor: 'rgba(106,235,201,0.12)',
                        border: '1px solid rgba(106,235,201,0.2)',
                        borderRadius: '14px 14px 2px 14px',
                        padding: '10px 14px',
                        maxWidth: '80%',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#fff',
                          lineHeight: '1.4em',
                          margin: 0,
                        }}
                      >
                        What did Marcus say about the board presentation last
                        session?
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        backgroundColor: 'rgb(106,235,201)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#000',
                        }}
                      >
                        ✦
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        maxWidth: '85%',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '2px 14px 14px 14px',
                          padding: '10px 14px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: '1.4em',
                            margin: 0,
                          }}
                        >
                          Marcus felt underprepared going into the board
                          meeting. He committed to rehearsing his pitch with
                          Sarah before the next one.
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'rgb(106,235,201)',
                          backgroundColor: 'rgba(106,235,201,0.08)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          width: 'fit-content',
                        }}
                      >
                        ↳ Jan 22 session
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        backgroundColor: 'rgba(106,235,201,0.12)',
                        border: '1px solid rgba(106,235,201,0.2)',
                        borderRadius: '14px 14px 2px 14px',
                        padding: '10px 14px',
                        maxWidth: '80%',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#fff',
                          lineHeight: '1.4em',
                          margin: 0,
                        }}
                      >
                        Any pending actions from him?
                      </p>
                    </div>
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
