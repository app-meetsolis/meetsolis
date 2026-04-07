import {
  EyeOff,
  Radio,
  RefreshCw,
  List,
  GitMerge,
  MessageCircle,
} from 'lucide-react';

const cards = [
  {
    icon: <EyeOff size={20} />,
    title: 'No Blind Spots',
    desc: "AI continuously connects signals across cash, spend, and risk—so important changes don't slip through unnoticed.",
  },
  {
    icon: <Radio size={20} />,
    title: 'Actionable Signals',
    desc: 'Notifications are only surfaced when action is needed, with clear context and recommended next steps.',
  },
  {
    icon: <RefreshCw size={20} />,
    title: 'Always in Sync',
    desc: 'Your financial picture stays consistent and up to date across teams, tools, and time—no manual refresh required.',
  },
  {
    icon: <List size={20} />,
    title: 'Full Decision History',
    desc: 'Every assumption, change, and outcome is captured automatically, creating a clear record you can trust.',
  },
  {
    icon: <GitMerge size={20} />,
    title: 'Adaptive Logics',
    desc: 'Your recurring costs like pay, bills, and seasonal buys are tracked and managed so you stay on top of them all.',
  },
  {
    icon: <MessageCircle size={20} />,
    title: 'Designed for Real Decisions',
    desc: 'A calm, intuitive interface built for focus and trust—so teams can act with confidence, not hesitation.',
  },
];

export function RenanceStatsGrid() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            className="rn-badge"
            style={{ marginBottom: '16px', display: 'inline-flex' }}
          >
            Why teams rely on us
          </div>
          <h2
            className="rn-serif"
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: '800px',
              margin: '0 auto 16px',
            }}
          >
            Clarity, speed, and confidence, built into every decision.
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--rn-muted)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Purpose-built AI capabilities that help teams stay aligned, move
            faster, and make better financial decisions—without added
            complexity.
          </p>
        </div>

        {/* 3×2 card grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {cards.map(card => (
            <div
              key={card.title}
              className="rn-card"
              style={{ padding: '28px 24px' }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--rn-badge-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--rn-fg)',
                }}
              >
                {card.icon}
              </div>

              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--rn-fg)',
                  marginBottom: '8px',
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '13.5px',
                  color: 'var(--rn-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
