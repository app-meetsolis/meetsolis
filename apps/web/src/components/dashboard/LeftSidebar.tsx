'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Users, Sparkles, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/intelligence', label: 'Solis Intelligence', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-6 py-5">
        <Link href="/clients" className="text-xl font-bold text-white">
          MeetSolis
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 px-6 py-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

export function LeftSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 bg-[#001F3F] md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed left-4 top-4 z-50 md:hidden bg-[#001F3F] text-white hover:bg-[#003366]"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile: overlay sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-[#001F3F] md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
