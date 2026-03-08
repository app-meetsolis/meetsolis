/**
 * LeftSidebar Component
 * Story 2.9: Left sidebar nav — Clients, Intelligence, Settings
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Users, Sparkles, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Intelligence', href: '/intelligence', icon: Sparkles },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface LeftSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function LeftSidebar({
  isMobileOpen = false,
  onClose,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const sidebarContent = (
    <div className="flex h-full w-52 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
        <span className="text-xl font-bold text-[#001F3F]">MeetSolis</span>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-[#6B7280] hover:text-[#1A1A1A]"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#E8E4DD] text-[#001F3F]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1A1A1A]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#001F3F] text-xs font-medium text-white">
            {initials}
          </div>
          {user?.name && (
            <span className="truncate text-sm font-medium text-[#1A1A1A]">
              {user.name}
            </span>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#6B7280] transition-colors hover:bg-gray-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">{sidebarContent}</div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
