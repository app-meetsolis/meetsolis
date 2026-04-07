'use client';

import { CheckCircle2 } from 'lucide-react';
import {
  ArrowUpRight,
  Activity,
  LayoutGrid,
  Lightbulb,
  Users,
  GitBranch,
} from 'lucide-react';

const featureCards = [
  {
    icon: <Activity size={18} />,
    title: 'Continuous Financial Awareness',
    desc: 'AI maintains a live understanding of your financial state—tracking cash, spend, and commitments without manual monitoring or reports.',
  },
  {
    icon: <LayoutGrid size={18} />,
    title: 'Decision-First Views',
    desc: "See your finances through the lens of decisions, not dashboards. From hiring to expansion, every view is organized around what you're trying to decide.",
  },
  {
    icon: <Lightbulb size={18} />,
    title: 'Explainable Financial Intelligences',
    desc: 'Every insight comes with clear reasoning. AI shows the drivers, assumptions, and tradeoffs behind each recommendation—so you can trust the outcome.',
  },
  {
    icon: <Users size={18} />,
    title: 'Shared Financial Context',
    desc: 'Scenarios, forecasts, and risks live in one shared space, keeping finance and leadership aligned without spreadsheets or status meetings.',
  },
  {
    icon: <GitBranch size={18} />,
    title: 'Structure That Scales Awareness',
    desc: 'Clear financial ownership, permissions, and accountability built for growing teams—without adding process or overhead.',
  },
];

const checkItems = [
  'Built for financial reality',
  'Adapts as conditions change',
  'Insights without manual work',
];

export function RenanceManageFinances() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start',
          }}
        >
          {/* Left — text */}
          <div>
            <div
              className="rn-badge"
              style={{ marginBottom: '20px', display: 'inline-flex' }}
            >
              Stay in control
            </div>

            <h2
              className="rn-serif"
              style={{
                fontSize: 'clamp(32px, 4vw, 52px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
              }}
            >
              Manage complex finances without the guesswork.
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'var(--rn-muted)',
                lineHeight: 1.7,
                marginBottom: '28px',
                maxWidth: '400px',
              }}
            >
              AI adapts to changing cash flow, spend, and risk—keeping decisions
              aligned, teams confident, and surprises to a minimum.
            </p>

            {/* Check list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
              }}
            >
              {checkItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--rn-border)',
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
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature cards stack */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {featureCards.map(card => (
              <div
                key={card.title}
                className="rn-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--rn-badge-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--rn-fg)',
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--rn-fg)',
                      marginBottom: '4px',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--rn-muted)',
                      lineHeight: 1.55,
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              </div>
            ))}

            {/* Inline CTA at bottom */}
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--rn-fg)',
                color: 'white',
                borderRadius: '14px',
                padding: '18px 20px',
                textDecoration: 'none',
                marginTop: '4px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.opacity = '0.85')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.opacity = '1')
              }
            >
              <span style={{ fontSize: '15px', fontWeight: 500 }}>
                Try Renance 30 days for free
              </span>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0a0a0a',
                }}
              >
                <ArrowUpRight size={15} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
