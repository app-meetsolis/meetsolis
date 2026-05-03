'use client';
import React from 'react';

const tasks = [
  { label: 'Session notes', before: 45, after: 0, tag: 'AI writes it' },
  { label: 'Pre-session prep', before: 20, after: 3, tag: 'Ask Solis' },
  {
    label: 'Finding past insights',
    before: 15,
    after: 1,
    tag: 'Solis Intelligence',
  },
  { label: 'Action item tracking', before: 10, after: 0, tag: 'Automatic' },
];

const MAX_TIME = 45;

export default function MetricsSection() {
  return (
    <section
      className="w-full flex flex-col items-center p-3 md:p-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div
        className="w-full max-w-[1200px] rounded-[32px] overflow-hidden relative px-6 py-10 sm:px-10 md:p-16"
        style={{ backgroundColor: '#000000' }}
      >
        {/* Glow effects */}
        <div
          className="absolute"
          style={{
            width: '322px',
            height: '322px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.5,
            bottom: '-169px',
            left: '-14px',
            zIndex: 0,
          }}
        />
        <div
          className="absolute"
          style={{
            width: '950px',
            height: '150px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.3,
            bottom: '-83px',
            left: '-328px',
            zIndex: 0,
          }}
        />
        <div
          className="absolute"
          style={{
            width: '1500px',
            height: '150px',
            borderRadius: '100%',
            backgroundColor: 'rgb(106,235,201)',
            filter: 'blur(150px)',
            opacity: 0.5,
            bottom: '-84px',
            left: '-603px',
            zIndex: 0,
          }}
        />
        <div
          className="absolute bottom-0"
          style={{
            left: 'calc(50% - 448px)',
            width: '896px',
            height: '2px',
            background: 'linear-gradient(90deg, #000, #6aebc9, #000)',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12"
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          {/* Left: Text + Stats */}
          <div className="flex flex-col gap-6 max-w-[420px] w-full">
            <div className="flex flex-col gap-4">
              <span
                className="section-badge"
                style={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  width: 'fit-content',
                }}
              >
                TIME RECLAIMED
              </span>
              <h3
                style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1em',
                  color: '#ffffff',
                }}
              >
                Hours back. <br />
                Every week. Automatically.
              </h3>
            </div>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.02em',
                lineHeight: '1.5em',
              }}
            >
              See exactly where MeetSolis eliminates the admin work that follows
              every coaching session.
            </p>

            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: '100%',
              }}
            />

            <div className="flex items-start gap-4 flex-wrap">
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
                  ~8 hrs
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Saved weekly
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
                  0 min
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  On session notes
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
                  100%
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Actions captured
                </p>
              </div>
            </div>
          </div>

          {/* Right: Before vs After bars */}
          <div className="flex flex-col gap-5 w-full md:w-[420px] md:flex-shrink-0">
            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                  }}
                >
                  BEFORE
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: 'rgb(106,235,201)',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                  }}
                >
                  AFTER
                </span>
              </div>
            </div>

            {tasks.map((task, i) => {
              const beforePct = (task.before / MAX_TIME) * 100;
              const afterPct = (task.after / MAX_TIME) * 100;
              const saved =
                task.before === 0
                  ? 100
                  : Math.round(
                      ((task.before - task.after) / task.before) * 100
                    );

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#ffffff',
                      }}
                    >
                      {task.label}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'rgb(106,235,201)',
                        backgroundColor: 'rgba(106,235,201,0.12)',
                        borderRadius: '6px',
                        padding: '3px 10px',
                      }}
                    >
                      -{saved}%
                    </span>
                  </div>

                  {/* Before bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: '16px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${beforePct}%`,
                          height: '100%',
                          background:
                            'linear-gradient(90deg, rgba(255,255,255,0.45), rgba(255,255,255,0.25))',
                          borderRadius: '6px',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.5)',
                        width: '46px',
                        flexShrink: 0,
                      }}
                    >
                      {task.before} min
                    </span>
                  </div>

                  {/* After bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: '16px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      {task.after > 0 && (
                        <div
                          style={{
                            width: `${afterPct}%`,
                            height: '100%',
                            background:
                              'linear-gradient(90deg, rgb(106,235,201), rgb(22,167,129))',
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'rgb(106,235,201)',
                        width: '46px',
                        flexShrink: 0,
                      }}
                    >
                      {task.after === 0 ? '0 min' : `${task.after} min`}
                    </span>
                  </div>

                  {/* Tag caption — always below, consistent position */}
                  {task.tag && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'rgba(106,235,201,0.6)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      ✦ {task.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
