export function RenanceHero() {
  return (
    <section
      style={{
        paddingTop: '80px',
        paddingBottom: '0',
        textAlign: 'center',
      }}
    >
      <div className="rn-container">
        {/* Headline */}
        <h1
          className="rn-serif"
          style={{
            fontSize: 'clamp(52px, 7vw, 88px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 auto 24px',
            maxWidth: '800px',
          }}
        >
          Meet{' '}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--rn-fg)',
                flexShrink: 0,
                verticalAlign: 'middle',
                position: 'relative',
                top: '-4px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="5" fill="white" />
              </svg>
            </span>{' '}
            Renance.
          </span>
          <br />
          The Finance Renaissance.
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '16px',
            color: 'var(--rn-muted)',
            maxWidth: '480px',
            margin: '0 auto 32px',
            lineHeight: 1.65,
          }}
        >
          Renance is an AI-first finance platform that understands your numbers,
          watches for risk, and helps you make the right call before it matters.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '64px',
          }}
        >
          <a href="#" className="rn-btn-primary">
            Start free trial
          </a>
          <a href="#" className="rn-btn-secondary">
            Schedule a call
          </a>
        </div>

        {/* Dashboard Mockup — full frame with painting on all sides */}
        <div
          style={{
            position: 'relative',
            maxWidth: '920px',
            margin: '0 auto',
            borderRadius: '20px 20px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -12px 60px rgba(0,0,0,0.12)',
          }}
        >
          {/* Renaissance painting background — full coverage */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'url(https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&q=85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          />

          {/* Dashboard UI — with painting visible as border on all sides */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              margin: '22px 22px 0',
              background: '#faf9f7',
              borderRadius: '10px 10px 0 0',
              border: '1px solid rgba(0,0,0,0.12)',
              borderBottom: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Dashboard top bar */}
            <div
              style={{
                borderBottom: '1px solid #ece9e3',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: '#f5f3ef',
              }}
            >
              {/* Brand */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    background: '#e8e4dc',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#555',
                  }}
                >
                  V
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#374151',
                    fontWeight: 600,
                  }}
                >
                  Vilkovac
                </span>
                <span style={{ fontSize: '10px', color: '#bbb' }}>▾</span>
              </div>

              {/* Search */}
              <div
                style={{
                  flex: 1,
                  maxWidth: '380px',
                  background: 'white',
                  border: '1px solid #e0ddd8',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '10px' }}>🔍</span>
                Search or jump to...
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '9px',
                    background: '#f3f4f6',
                    border: '1px solid #e0e0e0',
                    borderRadius: '3px',
                    padding: '1px 4px',
                    color: '#999',
                  }}
                >
                  ⌘K
                </span>
              </div>

              {/* Actions */}
              <div
                style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
              >
                <button
                  style={{
                    padding: '5px 12px',
                    background: '#e8e4dc',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: '#374151',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Move money ▾
                </button>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    background: '#e8e4dc',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ⬆
                </div>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    background: '#e8e4dc',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🔔
                </div>
              </div>
            </div>

            {/* Body: Sidebar + Main */}
            <div style={{ display: 'flex', height: '420px' }}>
              {/* Sidebar */}
              <div
                style={{
                  width: '170px',
                  borderRight: '1px solid #ece9e3',
                  padding: '14px 0',
                  flexShrink: 0,
                  background: '#f5f3ef',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {[
                    { icon: '⊞', label: 'Home', active: true },
                    { icon: '↕', label: 'Transactions' },
                    { icon: '◈', label: 'Payments' },
                    { icon: '▣', label: 'Cards' },
                    { icon: '◎', label: 'Capital' },
                    { icon: '◉', label: 'Accounts' },
                  ].map(({ icon, label, active }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 16px',
                        background: active ? 'rgba(0,0,0,0.07)' : 'transparent',
                        cursor: 'pointer',
                        borderRadius: active ? '4px' : '0',
                        margin: active ? '0 8px' : '0',
                        paddingLeft: active ? '8px' : '16px',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {icon}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: active ? '#111827' : '#6b7280',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0 16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 0',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      ⚙
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Settings
                    </span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div
                style={{
                  flex: 1,
                  padding: '20px 24px',
                  overflowY: 'hidden',
                  background: '#faf9f7',
                }}
              >
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: '0 0 12px',
                  }}
                >
                  Welcome, Client
                </h2>

                {/* Action buttons */}
                <div
                  style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
                >
                  {['Send', 'Request', 'Transfer', 'Pay bill'].map(action => (
                    <button
                      key={action}
                      style={{
                        padding: '5px 12px',
                        background: 'transparent',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '9px', color: '#aaa' }}>↗</span>{' '}
                      {action}
                    </button>
                  ))}
                  <button
                    style={{
                      padding: '5px 12px',
                      background: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#374151',
                      marginLeft: 'auto',
                    }}
                  >
                    ⋮⋮ Rearrange
                  </button>
                </div>

                {/* Budget Allocation chart header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Annual Budget Allocation
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Year to date ⊙
                  </span>
                </div>

                {/* Sankey / stream chart */}
                <div
                  style={{
                    position: 'relative',
                    height: '270px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #ece9e3',
                    overflow: 'hidden',
                    padding: '12px',
                  }}
                >
                  {/* Left labels */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '60px',
                    }}
                  >
                    <span style={{ fontSize: '9px', color: '#9ca3af' }}>
                      Marketing
                    </span>
                    <span style={{ fontSize: '9px', color: '#9ca3af' }}>
                      Operations
                    </span>
                  </div>

                  {/* Stream chart SVG */}
                  <svg
                    viewBox="0 0 600 240"
                    style={{
                      width: '100%',
                      height: '100%',
                      paddingLeft: '60px',
                      paddingRight: '80px',
                      boxSizing: 'border-box',
                    }}
                    preserveAspectRatio="none"
                  >
                    {/* Marketing streams — top group, flowing right */}
                    {[
                      {
                        d: 'M0,20 C150,10 300,5 600,5',
                        opacity: 0.9,
                        strokeW: 14,
                      },
                      {
                        d: 'M0,38 C150,26 300,22 600,22',
                        opacity: 0.75,
                        strokeW: 12,
                      },
                      {
                        d: 'M0,56 C150,44 300,40 600,40',
                        opacity: 0.6,
                        strokeW: 10,
                      },
                      {
                        d: 'M0,72 C150,60 300,57 600,58',
                        opacity: 0.5,
                        strokeW: 9,
                      },
                      {
                        d: 'M0,88 C150,78 300,74 600,76',
                        opacity: 0.4,
                        strokeW: 8,
                      },
                    ].map((s, i) => (
                      <path
                        key={`top-${i}`}
                        d={s.d}
                        stroke={`hsl(${220 + i * 12},${30 - i * 3}%,${70 - i * 3}%)`}
                        strokeWidth={s.strokeW}
                        fill="none"
                        opacity={s.opacity}
                        strokeLinecap="round"
                      />
                    ))}

                    {/* Dashed divider */}
                    <line
                      x1="0"
                      y1="120"
                      x2="600"
                      y2="120"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />

                    {/* Operations streams — bottom group */}
                    {[
                      {
                        d: 'M0,152 C150,145 300,142 600,142',
                        opacity: 0.85,
                        strokeW: 12,
                      },
                      {
                        d: 'M0,168 C150,162 300,160 600,161',
                        opacity: 0.7,
                        strokeW: 10,
                      },
                      {
                        d: 'M0,183 C150,178 300,175 600,177',
                        opacity: 0.55,
                        strokeW: 9,
                      },
                      {
                        d: 'M0,197 C150,194 300,191 600,193',
                        opacity: 0.45,
                        strokeW: 8,
                      },
                      {
                        d: 'M0,211 C150,208 300,206 600,207',
                        opacity: 0.35,
                        strokeW: 7,
                      },
                      {
                        d: 'M0,224 C150,221 300,220 600,220',
                        opacity: 0.25,
                        strokeW: 6,
                      },
                    ].map((s, i) => (
                      <path
                        key={`bot-${i}`}
                        d={s.d}
                        stroke={`hsl(${30 + i * 8},${25 - i * 2}%,${72 - i * 3}%)`}
                        strokeWidth={s.strokeW}
                        fill="none"
                        opacity={s.opacity}
                        strokeLinecap="round"
                      />
                    ))}

                    {/* Vertical bar connector at right */}
                    <rect
                      x="570"
                      y="2"
                      width="6"
                      height="88"
                      rx="3"
                      fill="#5b6ab4"
                      opacity={0.85}
                    />
                    <rect
                      x="570"
                      y="140"
                      width="6"
                      height="82"
                      rx="3"
                      fill="#c4a882"
                      opacity={0.8}
                    />
                  </svg>

                  {/* Right category labels */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        color: '#555',
                        fontWeight: 600,
                      }}
                    >
                      Digital ads
                    </span>
                    {[
                      'SEO & Search',
                      'Email Marketing',
                      'Social Media',
                      'Partnerships',
                    ].map(cat => (
                      <span
                        key={cat}
                        style={{ fontSize: '9px', color: '#9ca3af' }}
                      >
                        {cat}
                      </span>
                    ))}
                    <div style={{ height: '8px' }} />
                    <span
                      style={{
                        fontSize: '9px',
                        color: '#555',
                        fontWeight: 600,
                      }}
                    >
                      Engineering
                    </span>
                    {[
                      'Research',
                      'AI',
                      'Analytics',
                      'QA & Testing',
                      'UX Design',
                      'Prototyping',
                    ].map(cat => (
                      <span
                        key={cat}
                        style={{ fontSize: '9px', color: '#9ca3af' }}
                      >
                        {cat}
                      </span>
                    ))}
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
