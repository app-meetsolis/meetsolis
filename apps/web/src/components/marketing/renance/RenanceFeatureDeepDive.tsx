'use client';

import { CheckCircle2 } from 'lucide-react';

interface FeatureDeepDiveProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}

export function RenanceFeatureDeepDive({
  badge,
  badgeIcon,
  title,
  description,
  features,
  visual,
  reverse = false,
}: FeatureDeepDiveProps) {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
            direction: reverse ? 'rtl' : 'ltr',
          }}
          className="md:grid-cols-2 grid-cols-1"
        >
          {/* Text side */}
          <div style={{ direction: 'ltr' }}>
            <div
              className="rn-badge"
              style={{ marginBottom: '20px', display: 'inline-flex' }}
            >
              {badgeIcon && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {badgeIcon}
                </span>
              )}
              <span>{badge}</span>
            </div>

            <h2
              className="rn-serif"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
              }}
            >
              {title}
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'var(--rn-muted)',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '440px',
              }}
            >
              {description}
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {features.map((feat, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 0',
                    borderBottom:
                      i < features.length - 1
                        ? '1px solid var(--rn-border)'
                        : '1px solid var(--rn-border)',
                  }}
                >
                  <CheckCircle2
                    size={16}
                    style={{ color: 'var(--rn-green)', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--rn-fg)',
                      fontWeight: 500,
                    }}
                  >
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div style={{ direction: 'ltr' }}>{visual}</div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pre-built visuals for each deep dive ─── */

export function RiskRadarVisual() {
  return (
    <div
      className="rn-card"
      style={{
        aspectRatio: '1 / 0.9',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--rn-card)',
      }}
    >
      {/* Background painting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url(https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.55,
        }}
      />

      {/* Floating card */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          width: '260px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'white',
              fontWeight: 700,
            }}
          >
            !
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>
            Runway risk detected
          </span>
        </div>
        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          At current burn, runway drops below 6 months in 47 days.
        </p>
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            style={{
              padding: '5px 12px',
              background: '#0a0a0a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            View forecast
          </button>
          <button
            style={{
              padding: '5px 12px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function GrowthReadinessVisual() {
  return (
    <div
      className="rn-card"
      style={{
        aspectRatio: '1 / 0.9',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Watercolor map background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          filter: 'sepia(0.4)',
        }}
      />

      {/* UI overlay */}
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Chat bubble */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#111',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            alignSelf: 'flex-start',
            maxWidth: '80%',
          }}
        >
          Can we expand into a new market?
        </div>

        {/* Data table */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              fontSize: '12px',
              borderBottom: '1px solid #f0f0f0',
              padding: '8px 12px',
              color: '#9ca3af',
            }}
          >
            <span>Health</span>
            <span>After expansion</span>
            <span></span>
          </div>
          {[
            {
              label: 'Runway',
              after: '8.6 months',
              status: 'warn',
            },
            {
              label: 'Burn',
              after: '+$18,000',
              status: 'warn',
            },
          ].map(({ label, after, status }) => (
            <div
              key={label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                fontSize: '12px',
                borderBottom: '1px solid #f0f0f0',
                padding: '8px 12px',
                alignItems: 'center',
                background: '#fff9f9',
              }}
            >
              <span style={{ color: '#111', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{after}</span>
              <span style={{ color: '#ef4444' }}>↑</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div
          style={{
            background: 'white',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>Not yet.</span>{' '}
            <span style={{ color: '#374151' }}>
              Expansion would drop runway below 9 months.
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            Re-evaluate after next revenue cycle.
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComplianceVisual() {
  return (
    <div
      className="rn-card"
      style={{
        aspectRatio: '1 / 0.9',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Parchment background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#e8e0d0',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
        }}
      />

      {/* Shield illustration */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <svg
          width="200"
          height="220"
          viewBox="0 0 200 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield body */}
          <path
            d="M100 10 L180 45 L180 120 C180 170 140 200 100 215 C60 200 20 170 20 120 L20 45 Z"
            fill="#c4b5a0"
            stroke="#a09080"
            strokeWidth="2"
            opacity={0.8}
          />
          {/* Inner shield */}
          <path
            d="M100 30 L165 60 L165 118 C165 158 132 183 100 196 C68 183 35 158 35 118 L35 60 Z"
            fill="rgba(255,255,255,0.3)"
            stroke="#a09080"
            strokeWidth="1"
          />
          {/* Check mark */}
          <path
            d="M70 110 L90 130 L130 90"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          {/* Decorative flourishes */}
          <ellipse
            cx="100"
            cy="45"
            rx="20"
            ry="5"
            fill="rgba(255,255,255,0.2)"
          />
          <line
            x1="20"
            y1="45"
            x2="100"
            y2="45"
            stroke="#a09080"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
          <line
            x1="100"
            y1="45"
            x2="180"
            y2="45"
            stroke="#a09080"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
        </svg>

        {/* Floating label */}
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#10b981',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
            }}
          />
          Compliance Active
        </div>
      </div>
    </div>
  );
}
