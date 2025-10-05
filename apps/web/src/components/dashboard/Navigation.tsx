/**
 * Navigation Component
 * Dashboard navigation menu with keyboard shortcuts
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { Home, Video, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    shortcut: 'ctrl+d',
    shortcutDisplay: 'Ctrl+D',
  },
  {
    label: 'Meetings',
    href: '/dashboard/meetings',
    icon: Video,
    shortcut: 'ctrl+m',
    shortcutDisplay: 'Ctrl+M',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    shortcut: 'ctrl+,',
    shortcutDisplay: 'Ctrl+,',
  },
];

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Setup keyboard shortcuts
  useHotkeys('ctrl+d', () => router.push('/dashboard'));
  useHotkeys('ctrl+m', () => router.push('/dashboard/meetings'));
  useHotkeys('ctrl+,', () => router.push('/dashboard/settings'));

  return (
    <TooltipProvider>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav
        className={cn(
          'flex flex-col gap-2 md:flex-row md:gap-4',
          mobileMenuOpen ? 'flex' : 'hidden md:flex',
          className
        )}
      >
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'justify-start gap-2',
                    isActive && 'bg-[#001F3F] text-white hover:bg-[#001F3F]/90'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {item.label} ({item.shortcutDisplay})
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
