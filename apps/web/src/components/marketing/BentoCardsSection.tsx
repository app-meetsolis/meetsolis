'use client';
import React from 'react';
import Image from 'next/image';

export default function BentoCardsSection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      style={{ padding: '64px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-3">
        {/* Left Card: Manage Access */}
        <div
          className="flex flex-col gap-4 rounded-[20px] overflow-hidden"
          style={{
            backgroundColor: '#000000',
            width: '300px',
            minHeight: '582px',
            padding: '36px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Dark card content */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(26,29,33,0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
            }}
          >
            {/* Title */}
            <div>
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: '1em',
                }}
              >
                Manage who can control the agents
              </h4>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '8px',
                  lineHeight: '1.5em',
                }}
              >
                Select which users can access and view agents.
              </p>
            </div>

            {/* Input field */}
            <div
              style={{
                backgroundColor: '#1a1d21',
                border: '1px solid #363a3d',
                borderRadius: '8px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px 0 8px',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                {/* Chip 1 */}
                <div
                  style={{
                    background:
                      'linear-gradient(117.58deg, rgba(215,236,236,0.16) 0%, rgba(204,234,234,0) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src="https://framerusercontent.com/images/E3vzjdpFuSWiVeurdyPGMrSWk.png"
                      alt="Jessie"
                      width={24}
                      height={24}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgb(155,156,158)',
                    }}
                  >
                    Jessie
                  </span>
                </div>
                {/* Chip 2 */}
                <div
                  style={{
                    background:
                      'linear-gradient(117.58deg, rgba(215,236,236,0.16) 0%, rgba(204,234,234,0) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src="https://framerusercontent.com/images/mo2Pbj2hqScYdc4e7VO88ooki4.png"
                      alt="Mark"
                      width={24}
                      height={24}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgb(155,156,158)',
                    }}
                  >
                    Mark
                  </span>
                </div>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgb(106,235,201)',
                  }}
                >
                  can edit
                </span>
              </div>
            </div>

            {/* Invite button */}
            <div
              style={{
                backgroundColor: 'rgb(106,235,201)',
                borderRadius: '12px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '8px 24px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgb(12,17,50)',
                }}
              >
                Invite
              </span>
            </div>

            {/* User list */}
            <div className="flex flex-col gap-3">
              {[
                {
                  name: 'You',
                  handle: '@chagatai',
                  role: 'Owner',
                  roleColor: 'rgb(106,235,201)',
                  img: 'https://framerusercontent.com/images/FVjwWr85ut7DBy7LiAzsJoNMlLM.png',
                },
                {
                  name: 'Zhen Klyia',
                  handle: '@zhen-zhen',
                  role: 'Editor',
                  roleColor: 'rgb(130,219,247)',
                  img: 'https://framerusercontent.com/images/dlhgx3fMLQZlK7XF8F8pg5OGE.png',
                },
                {
                  name: 'Thomas Muller',
                  handle: '@tho_33',
                  role: 'Editor',
                  roleColor: 'rgb(130,219,247)',
                  img: 'https://framerusercontent.com/images/GsvGVDjt9Og2l8MpVzjNi5xbrS0.png',
                },
                {
                  name: 'Karl Zuber',
                  handle: '@karlz',
                  role: 'Viewer',
                  roleColor: 'rgb(166,176,242)',
                  img: 'https://framerusercontent.com/images/OrlifnTlYPRMLyxn1o7nUVu4IB8.png',
                },
              ]?.map((user, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={user?.img}
                        alt={user?.name}
                        width={48}
                        height={48}
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#ffffff',
                        }}
                      >
                        {user?.name}
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'rgb(106,235,201)',
                        }}
                      >
                        {user?.handle}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: user?.roleColor,
                      background:
                        'linear-gradient(117.58deg, rgba(215,236,236,0.16) 0%, rgba(204,234,234,0) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '4px 12px',
                    }}
                  >
                    {user?.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Cards */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Top row: Podcast + Smart Tasks */}
          <div className="flex gap-3">
            {/* Podcast Card */}
            <div
              className="flex-1 rounded-[20px] overflow-hidden relative"
              style={{
                border: '1px solid rgb(228,228,228)',
                backgroundColor: '#ffffff',
                minHeight: '286px',
              }}
            >
              {/* Green gradient background */}
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
                {/* Overlapping avatars */}
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  {[
                    'https://framerusercontent.com/images/qT2RDznEpOrJtcHZv3nDznB7QOk.jpg',
                    'https://framerusercontent.com/images/lTKrFGv3E8wzq6LqHhJddpV1vE.jpg',
                    'https://framerusercontent.com/images/6NveBVCzvNa67ChHcDODa017M.jpg',
                    'https://framerusercontent.com/images/05knyzw0rUgULM6deRVbL10UAw.jpg',
                  ]?.map((img, i) => (
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
                  AI AGENTS
                </p>
                <h4
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#000000',
                    lineHeight: '1em',
                  }}
                >
                  Let&apos;s discuss AI Agent&apos;s future of the world.
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgb(10,77,59)',
                  }}
                >
                  2 hours 40 minutes
                </p>
                <a
                  href="https://spotify.com"
                  target="_blank"
                  rel="noopener"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '14px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #000000',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#000000',
                    width: 'fit-content',
                    textDecoration: 'none',
                    marginTop: '8px',
                  }}
                >
                  Play Podcast
                </a>
              </div>
            </div>

            {/* Smart Tasks Card */}
            <div
              className="flex-1 rounded-[20px] overflow-hidden relative"
              style={{
                border: '1px solid rgb(228,228,228)',
                backgroundColor: '#ffffff',
                minHeight: '286px',
              }}
            >
              <div style={{ position: 'relative', height: '100%' }}>
                <Image
                  src="https://framerusercontent.com/images/6xHEJdY0oIyqlQjGm0IcaDZoNwg.png"
                  alt="Smart Tasks"
                  fill
                  style={{ objectFit: 'cover' }}
                />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '36px',
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
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
                    Smart Tasks
                  </h4>
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'rgba(241,254,248,0.7)',
                      marginTop: '4px',
                    }}
                  >
                    Let AI handle it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Multi-Agent Card */}
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              border: '1px solid rgb(228,228,228)',
              backgroundColor: '#000000',
              height: '285px',
              display: 'flex',
            }}
          >
            {/* Left text */}
            <div
              className="flex flex-col gap-4 p-9"
              style={{ flex: '0.4', borderRight: '1px solid #131619' }}
            >
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: '1em',
                }}
              >
                Multi-Agent
              </h4>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: '1.5em',
                }}
              >
                Deploy and manage multiple AI agents in parallel to handle
                complex, multi-step operations.
              </p>
            </div>

            {/* Right: UI mockup */}
            <div className="flex-1 overflow-hidden p-6">
              <div
                style={{
                  backgroundColor: 'rgba(26,29,33,0.96)',
                  borderRadius: '20px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '24px',
                    borderBottom: '1px solid #131619',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#ffffff',
                      }}
                    >
                      Orbital Oddysey
                    </h4>
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '4px',
                      }}
                    >
                      Marketing Campaign for a new TV series Launch
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Avatars */}
                    {[
                      'https://framerusercontent.com/images/VnGF1oQqX1poiXheBo2UcV25x0.png',
                      'https://framerusercontent.com/images/i0Kkhim9JtWdlb5ssQ6h8Nq1A8.png',
                    ]?.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '2px solid #0d0f10',
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
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgb(209,213,221)',
                        backgroundColor: '#1a1d21',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        border: '2px solid #0d0f10',
                      }}
                    >
                      +4
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        padding: '4px 8px',
                      }}
                    >
                      Share
                    </span>
                  </div>
                </div>
                {/* Nav */}
                <div
                  style={{
                    padding: '24px',
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}
                  >
                    Artificium
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 8px',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Chat
                    </span>
                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'rgb(106,235,201)',
                        borderRadius: '4px 4px 0 0',
                        position: 'absolute',
                        bottom: '-24px',
                        left: 0,
                        right: 0,
                      }}
                    />
                  </div>
                  <span
                    style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}
                  >
                    Library
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
