'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Monitor } from 'lucide-react';

const MOBILE_ALLOWED = [
  '/',
  '/sign-in',
  '/sign-up',
  '/privacy',
  '/terms',
  '/about',
];

function isAllowedOnMobile(pathname: string) {
  return MOBILE_ALLOWED.some(
    p => pathname === p || pathname.startsWith(p + '/')
  );
}

export function MobileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    setMounted(true);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted) return <>{children}</>;
  if (isMobile && !isAllowedOnMobile(pathname)) return <DesktopOnlyScreen />;
  return <>{children}</>;
}

function DesktopOnlyScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Monitor className="h-8 w-8 text-[#4ADE80]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-white">Desktop Only</h1>
      <p className="max-w-xs text-sm leading-relaxed text-white/50">
        MeetSolis is designed for desktop. Please visit us on a larger screen.
      </p>
    </div>
  );
}
