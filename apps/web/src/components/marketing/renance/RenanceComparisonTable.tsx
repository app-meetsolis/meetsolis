import { CheckCircle2, X } from 'lucide-react';

const rows = [
  {
    feature: 'Natural-language queries',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Decision simulation',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Continuous risk monitoring',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'AI recommendations',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Financial memory & context',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Growth readiness checks',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Automated spend intelligence',
    general: false,
    manual: false,
    renance: true,
  },
  {
    feature: 'Audit trails & accountability',
    general: true,
    manual: false,
    renance: true,
  },
  {
    feature: 'For finance teams',
    general: false,
    manual: false,
    renance: true,
  },
];

function Check({ val }: { val: boolean }) {
  if (val) {
    return (
      <CheckCircle2
        size={20}
        style={{ color: 'var(--rn-green)', margin: '0 auto' }}
      />
    );
  }
  return (
    <X
      size={18}
      style={{ color: 'var(--rn-border)', margin: '0 auto', opacity: 0.7 }}
    />
  );
}

export function RenanceComparisonTable() {
  return (
    <section id="compare" style={{ padding: '80px 0' }}>
      <div className="rn-container">
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            className="rn-serif"
            style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}
          >
            Made for the way
            <br />
            finance teams work.
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--rn-muted)',
              lineHeight: 1.65,
              maxWidth: '380px',
            }}
          >
            See how Renance compares to general tools and manual workflows.
          </p>
        </div>

        {/* Table */}
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--rn-border)',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              background: 'var(--rn-card)',
              borderBottom: '1px solid var(--rn-border)',
            }}
          >
            <div style={{ padding: '16px 24px' }} />
            {['General Tools', 'Manual Workflows', 'Renance'].map((col, i) => (
              <div
                key={col}
                style={{
                  padding: '16px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: i === 2 ? 'white' : 'var(--rn-fg)',
                  background: i === 2 ? 'transparent' : 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {i === 2 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'url(https://images.unsplash.com/photo-1490750967868-88df5691cc9d?w=400&q=80)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    color: i === 2 ? 'white' : 'var(--rn-fg)',
                    textShadow: i === 2 ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                  }}
                >
                  {col}
                </span>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {rows.map((row, ri) => (
            <div
              key={row.feature}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                borderBottom:
                  ri < rows.length - 1 ? '1px solid var(--rn-border)' : 'none',
                background: ri % 2 === 0 ? 'white' : 'var(--rn-bg)',
              }}
            >
              <div
                style={{
                  padding: '14px 24px',
                  fontSize: '14px',
                  color: 'var(--rn-fg)',
                  fontWeight: 400,
                }}
              >
                {row.feature}
              </div>
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check val={row.general} />
              </div>
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check val={row.manual} />
              </div>
              {/* Renance column with floral bg */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1490750967868-88df5691cc9d?w=400&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  <Check val={row.renance} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
