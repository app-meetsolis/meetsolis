'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  Home,
  Users,
  Sparkles,
  Settings,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { SidebarCard } from './SidebarCard';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
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
  const { user, isLoading: authLoading } = useAuth();
  const { theme, toggle, mounted } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col bg-card border-r border-border transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-14' : 'w-48'
      )}
    >
      {/* -- Logo / Toggle row -- */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'justify-between px-3'
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 shrink-0 rounded-md bg-[#37ea9e] flex items-center justify-center">
              <span className="text-[9px] font-bold text-black">MS</span>
            </div>
            <span className="text-sm font-bold text-foreground truncate">
              MeetSolis
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* -- Nav Items -- */}
      <nav className="flex-1 space-y-1 py-3 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);

          return (
            <div key={href} className="relative">
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary" />
              )}
              <Link
                href={href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center rounded-md text-xs font-medium transition-colors duration-150',
                  collapsed
                    ? 'h-8 w-8 justify-center'
                    : 'gap-2.5 px-2.5 py-2 w-full',
                  isActive
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon
                  className={cn('shrink-0', isActive ? 'text-primary' : '')}
                  style={{ width: 15, height: 15 }}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* -- Sidebar card -- */}
      {!collapsed && <SidebarCard />}

      {/* -- Bottom section -- */}
      <div
        className={cn(
          'border-t border-border py-2 space-y-0.5',
          collapsed ? 'px-2 flex flex-col items-center' : 'px-2'
        )}
      >
        {/* Theme toggle */}
        {mounted &&
          (collapsed ? (
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted p-1">
              <button
                onClick={() => theme !== 'light' && toggle()}
                title="Light mode"
                className={cn(
                  'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                  theme === 'light'
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun style={{ width: 14, height: 14 }} />
              </button>
              <button
                onClick={() => theme !== 'dark' && toggle()}
                title="Dark mode"
                className={cn(
                  'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                  theme === 'dark'
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2.5 py-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <div className="flex items-center rounded-full bg-muted p-0.5 gap-0.5">
                <button
                  onClick={() => theme !== 'light' && toggle()}
                  title="Light mode"
                  className={cn(
                    'h-5 w-5 flex items-center justify-center rounded-full transition-colors',
                    theme === 'light'
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun style={{ width: 11, height: 11 }} />
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggle()}
                  title="Dark mode"
                  className={cn(
                    'h-5 w-5 flex items-center justify-center rounded-full transition-colors',
                    theme === 'dark'
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon style={{ width: 11, height: 11 }} />
                </button>
              </div>
            </div>
          ))}

        {/* Profile button with dropdown */}
        <div ref={profileRef} className="relative">
          {authLoading ? (
            <div
              className={cn(
                'flex items-center mt-1',
                collapsed ? 'h-8 w-8 justify-center' : 'gap-2.5 px-2.5 py-2'
              )}
            >
              <div className="skeleton h-6 w-6 rounded-full shrink-0" />
              {!collapsed && <div className="skeleton h-3 w-20 rounded-sm" />}
            </div>
          ) : (
            <button
              onClick={() => setProfileOpen(o => !o)}
              title={collapsed ? (user?.name ?? 'Profile') : undefined}
              className={cn(
                'flex items-center rounded-md text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground w-full mt-1',
                collapsed ? 'h-8 w-8 justify-center' : 'gap-2.5 px-2.5 py-2'
              )}
            >
              <div className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-[#37ea9e] text-[9px] font-bold text-black">
                {initials}
              </div>
              {!collapsed && user?.name && (
                <span className="truncate text-xs font-medium text-secondary-foreground flex-1 text-left">
                  {user.name}
                </span>
              )}
            </button>
          )}

          {profileOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-1.5 z-50 min-w-[140px] rounded-md border border-border bg-popover shadow-xl py-1',
                collapsed ? 'left-full ml-2 bottom-0' : 'left-0'
              )}
            >
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              >
                <UserCircle
                  style={{ width: 14, height: 14 }}
                  className="shrink-0"
                />
                User Settings
              </Link>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:bg-accent hover:text-red-500 transition-colors"
              >
                <LogOut
                  style={{ width: 14, height: 14 }}
                  className="shrink-0"
                />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex md:shrink-0">{sidebarContent}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
