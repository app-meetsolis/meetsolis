const features = [
  {
    id: 'copilot',
    tag: 'AI Financial Copilot',
    title: 'AI Financial Copilot',
    desc: 'An always-on assistant that monitors your finances, flags risks, and proactively guides your next move — without being asked.',
    bgImage:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
    mockup: (
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '10px',
          padding: '14px',
          margin: '0 16px',
          backdropFilter: 'blur(4px)',
          fontSize: '12px',
          color: '#111',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>💬 Copilot</div>
        <div
          style={{
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '10px 12px',
            lineHeight: 1.5,
          }}
        >
          Your runway dropped to 7.2 months. Consider delaying the Q3 expansion
          by 30 days to reduce risk.
        </div>
        <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '11px' }}>
          Based on current burn rate • Updated 2 min ago
        </div>
      </div>
    ),
  },
  {
    id: 'cashflow',
    tag: 'Smart Cash Flow Forecasting',
    title: 'Smart Cash Flow Forecasting',
    desc: 'Predicts future cash positions using historical trends, committed spend, and revenue signal — weeks ahead.',
    bgImage:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    mockup: (
      <div style={{ padding: '0 16px', position: 'relative' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            padding: '12px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            12-Month Forecast
          </div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'flex-end',
              height: '60px',
            }}
          >
            {[60, 50, 70, 55, 80, 65, 90, 75, 95, 85, 100, 88].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i < 6 ? '#c4b5a0' : 'rgba(196,181,160,0.4)',
                  borderRadius: '3px 3px 0 0',
                  borderBottom: i >= 6 ? '1px dashed #c4b5a0' : 'none',
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'spend',
    tag: 'AI Spend Intelligence',
    title: 'AI Spend Intelligence',
    desc: 'Automatically analyzes spending patterns to surface inefficiencies, waste, and optimization opportunities, continuously.',
    bgImage:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80',
    mockup: (
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            padding: '12px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '9px',
                }}
              >
                ●
              </span>
              3 overlapping tools detected
            </span>
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111',
              marginBottom: '2px',
            }}
          >
            $4,800{' '}
            <span
              style={{ fontSize: '12px', fontWeight: 400, color: '#6b7280' }}
            >
              / year
            </span>
          </div>
          <div
            style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}
          >
            potential savings
          </div>
          <button
            style={{
              padding: '6px 14px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            Review subscriptions
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'simulator',
    tag: 'AI Decision Simulator',
    title: 'AI Decision Simulator',
    desc: 'Lets users simulate financial decisions and instantly understand second-order effects before committing.',
    bgImage:
      'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?w=600&q=80',
    mockup: (
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            padding: '12px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              $18,000{' '}
              <span
                style={{ fontSize: '11px', fontWeight: 400, color: '#9ca3af' }}
              >
                / year
              </span>
            </span>
            <button
              style={{
                padding: '4px 10px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              Adjust scenario
            </button>
          </div>
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              ● Safe
            </span>{' '}
            if revenue stays flat. Consider delaying by 30 days to reduce risk.
          </div>
        </div>
      </div>
    ),
  },
];

export function RenanceFeaturesGrid() {
  return (
    <section style={{ padding: '80px 0 0' }}>
      <div className="rn-container">
        {/* Section header */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            className="rn-serif"
            style={{
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Your finances,
            <br />
            orchestrated by AI
          </h2>
        </div>

        {/* 2×2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {features.map(feature => (
            <div
              key={feature.id}
              className="rn-card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Image / mockup area */}
              <div
                style={{
                  position: 'relative',
                  height: '220px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  paddingBottom: '16px',
                }}
              >
                {/* Background painting */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${feature.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.6,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                  }}
                >
                  {feature.mockup}
                </div>
              </div>

              {/* Text content */}
              <div style={{ padding: '20px 24px 24px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--rn-fg)',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--rn-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
