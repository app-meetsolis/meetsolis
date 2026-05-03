'use client';
import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    // Skip on touch devices — native momentum scroll is already smooth
    if ('ontouchstart' in window) return;

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let raf: number;
    const ease = 0.18;

    const onWheel = (e: WheelEvent) => {
      targetY = Math.max(
        0,
        Math.min(
          document.documentElement.scrollHeight - window.innerHeight,
          targetY + e.deltaY
        )
      );
      e.preventDefault();
    };

    // Sync if scroll changed externally (keyboard, scrollbar drag)
    const onScroll = () => {
      if (Math.abs(window.scrollY - currentY) > 12) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    };

    const tick = () => {
      const diff = targetY - currentY;
      currentY = Math.abs(diff) < 0.5 ? targetY : currentY + diff * ease;
      window.scrollTo(0, currentY);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
