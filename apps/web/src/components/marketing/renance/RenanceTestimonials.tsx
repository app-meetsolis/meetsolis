const testimonials = [
  {
    id: 1,
    name: 'Maria Lopez',
    role: 'VP Finance',
    company: 'Growbase',
    quote:
      "We finally stopped reacting to surprises. Renance watches our money so we don't have to—and it tells us what to do next, not just what happened.",
    avatar: 'ML',
    featured: true,
  },
  {
    id: 2,
    name: 'Sophie Nguyen',
    role: 'CFO',
    company: 'Larkfield',
    quote:
      'The decision simulator alone paid for itself in the first month. We avoided a hiring mistake that would have cost us three months of runway.',
    avatar: 'SN',
  },
  {
    id: 3,
    name: 'Jamie Patel',
    role: 'Head of Finance',
    company: 'Arcvest',
    quote:
      'Before Renance, forecasting took a week. Now it updates automatically and flags risks before I even open my laptop.',
    avatar: 'JP',
  },
  {
    id: 4,
    name: 'Alex Chen',
    role: 'Founder & CEO',
    company: 'Stacklane',
    quote:
      "As a non-finance founder, this tool gave me the confidence to make real decisions with our money. It's like having a CFO in your pocket.",
    avatar: 'AC',
  },
  {
    id: 5,
    name: 'Priya Sethi',
    role: 'Director of Ops',
    company: 'Nexigen',
    quote:
      'Our burn used to feel like a mystery. Now every dollar is accounted for and the team is aligned on what we can and cannot afford to do.',
    avatar: 'PS',
  },
  {
    id: 6,
    name: 'Marcus Reid',
    role: 'Co-founder',
    company: 'Folio AI',
    quote:
      'Renance flagged a duplicate subscription issue we had been missing for 8 months. Saved us $6,400 in the first week.',
    avatar: 'MR',
  },
];

function AvatarCircle({ initials }: { initials: string }) {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--rn-fg)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function RenanceTestimonials() {
  const [featured, ...rest] = testimonials;

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="rn-container">
        {/* Featured quote */}
        <div
          className="rn-card"
          style={{
            padding: '40px 48px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'var(--rn-badge-bg)',
              opacity: 0.5,
            }}
          />
          <blockquote
            className="rn-serif"
            style={{
              fontSize: 'clamp(22px, 2.5vw, 32px)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              marginBottom: '24px',
              color: 'var(--rn-fg)',
              position: 'relative',
              zIndex: 1,
              maxWidth: '820px',
              fontStyle: 'italic',
            }}
          >
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <AvatarCircle initials={featured.avatar} />
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--rn-fg)',
                }}
              >
                {featured.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--rn-muted)',
                }}
              >
                {featured.role}, {featured.company}
              </div>
            </div>
          </div>
        </div>

        {/* 5-card grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {rest.map(t => (
            <div key={t.id} className="rn-card" style={{ padding: '24px' }}>
              <blockquote
                style={{
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--rn-fg)',
                  marginBottom: '20px',
                  fontStyle: 'normal',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AvatarCircle initials={t.avatar} />
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--rn-fg)',
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--rn-muted)',
                    }}
                  >
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
