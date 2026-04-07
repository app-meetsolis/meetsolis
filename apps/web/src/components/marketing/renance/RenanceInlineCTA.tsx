'use client';

import { ArrowUpRight } from 'lucide-react';

export function RenanceInlineCTA() {
  return (
    <div className="rn-container" style={{ padding: '24px 40px' }}>
      <a
        href="#"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--rn-fg)',
          color: 'var(--rn-footer-fg)',
          borderRadius: '16px',
          padding: '20px 24px',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLElement).style.opacity = '0.9')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLElement).style.opacity = '1')
        }
      >
        <span style={{ fontSize: '16px', fontWeight: 500 }}>
          Try Renance 30 days for free
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'white',
            borderRadius: '8px',
            color: '#0a0a0a',
            flexShrink: 0,
          }}
        >
          <ArrowUpRight size={16} />
        </span>
      </a>
    </div>
  );
}
