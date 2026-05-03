'use client';
import { useEffect } from 'react';

export default function ClerkBadgeKill() {
  useEffect(() => {
    const kill = () => {
      document
        .querySelectorAll<HTMLElement>(
          '[class*="cl-badge"], [class*="cl-internal-"][class*="badge"], [data-clerk-badge], a[href*="clerk.com"], a[href*="clerk.dev"], .cl-footer__internal_keyless'
        )
        .forEach(el => {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('width', '0', 'important');
          el.style.setProperty('height', '0', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
        });
    };
    kill();
    const obs = new MutationObserver(kill);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
  return null;
}
