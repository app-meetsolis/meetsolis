export function RenanceLogoCloud() {
  return (
    <section
      style={{
        padding: '32px 0 48px',
        borderTop: '1px solid var(--rn-border)',
      }}
    >
      <div className="rn-container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--rn-muted)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Trusted by more than 2000+ finance teams:
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '40px',
              flex: 1,
            }}
          >
            {/* Logo placeholders as inline SVGs */}
            {/* Logo 1 */}
            <svg
              width="60"
              height="28"
              viewBox="0 0 60 28"
              fill="none"
              opacity={0.5}
            >
              <text
                x="0"
                y="20"
                fontFamily="sans-serif"
                fontSize="20"
                fontWeight="700"
                fill="#0a0a0a"
                letterSpacing="-1"
              >
                LOAN
              </text>
            </svg>

            {/* Logo 2 - Logoipsum style */}
            <svg
              width="110"
              height="24"
              viewBox="0 0 110 24"
              fill="none"
              opacity={0.5}
            >
              <circle cx="12" cy="12" r="10" stroke="#0a0a0a" strokeWidth="2" />
              <text
                x="28"
                y="17"
                fontFamily="sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="#0a0a0a"
              >
                Logoipsum
              </text>
            </svg>

            {/* Logo 3 */}
            <svg
              width="110"
              height="24"
              viewBox="0 0 110 24"
              fill="none"
              opacity={0.5}
            >
              <rect x="0" y="4" width="16" height="16" rx="3" fill="#0a0a0a" />
              <text
                x="22"
                y="17"
                fontFamily="sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="#0a0a0a"
              >
                Logoipsum
              </text>
            </svg>

            {/* Logo 4 */}
            <svg
              width="96"
              height="24"
              viewBox="0 0 96 24"
              fill="none"
              opacity={0.5}
            >
              <path d="M6 4 L18 4 L12 16 Z" fill="#0a0a0a" />
              <text
                x="24"
                y="17"
                fontFamily="sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="#0a0a0a"
                letterSpacing="2"
              >
                LIBRSY
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
