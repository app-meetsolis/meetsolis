const aiFeatures = [
  'AI Risk Radar',
  'Cash Flow Forecasting',
  'Spend Intelligence',
  'Decision Simulator',
  'Growth Readiness',
  'Compliance Watch',
  'Unified View',
  'Team Collaboration',
];

export function RenanceAISection() {
  const half = Math.ceil(aiFeatures.length / 2);
  const left = aiFeatures.slice(0, half);
  const right = aiFeatures.slice(half);

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '40px',
            alignItems: 'center',
          }}
          className="flex-col md:grid"
        >
          {/* Left badges */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'flex-end',
            }}
          >
            {left.map(feat => (
              <span
                key={feat}
                style={{
                  display: 'inline-flex',
                  padding: '8px 16px',
                  background: 'var(--rn-card)',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--rn-fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                {feat}
              </span>
            ))}
          </div>

          {/* Center text */}
          <div style={{ textAlign: 'center', maxWidth: '340px' }}>
            <h2
              className="rn-serif"
              style={{
                fontSize: 'clamp(44px, 5.5vw, 72px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              AI that
              <br />
              understands
              <br />
              <em>your money</em>
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--rn-muted)',
                marginTop: '16px',
                lineHeight: 1.6,
              }}
            >
              Every feature is built around a single goal: helping you make
              smarter financial decisions faster.
            </p>
          </div>

          {/* Right badges */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            {right.map(feat => (
              <span
                key={feat}
                style={{
                  display: 'inline-flex',
                  padding: '8px 16px',
                  background: 'var(--rn-card)',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--rn-fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
