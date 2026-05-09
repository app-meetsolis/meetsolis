'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import { CreditCard, Sliders, User, Shield } from 'lucide-react';
import type { Appearance } from '@clerk/types';
import { BillingTab } from './BillingTab';
import { PreferencesTab } from './PreferencesTab';
import { buildAppearance } from './appearance';
import { useTheme } from '@/hooks/useTheme';

const TABS = [
  { label: 'Profile', href: '/settings', icon: User, exact: true },
  { label: 'Security', href: '/settings/security', icon: Shield, exact: false },
  {
    label: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    exact: false,
  },
  {
    label: 'Preferences',
    href: '/settings/preferences',
    icon: Sliders,
    exact: false,
  },
];

export function SettingsClient() {
  const pathname = usePathname();
  const { theme, mounted } = useTheme();
  // Lazy init reads CSS vars synchronously — the pre-paint script in layout.tsx
  // has already applied .dark before React renders, so dark tokens are correct
  // on the very first frame, eliminating the white flash.
  const [appearance, setAppearance] = useState<Appearance>(() =>
    buildAppearance()
  );

  // Re-sync whenever user toggles the theme
  useEffect(() => {
    if (mounted) setAppearance(buildAppearance());
  }, [mounted, theme]);

  function isActive(tab: (typeof TABS)[number]) {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href) ?? false;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 shrink-0 flex items-center px-6 border-b border-border bg-card">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-foreground">
          Settings
        </h1>
      </div>

      {/* Custom tab nav — replaces Clerk's internal sidebar */}
      <div className="flex shrink-0 px-6 border-b border-border bg-card">
        {TABS.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              isActive(tab)
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-[14px] w-[14px]" />
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content — Clerk handles routing internally via path */}
      <div className="flex-1 overflow-auto p-6">
        <ClerkUserProfile
          path="/settings"
          routing="path"
          appearance={appearance}
        >
          <ClerkUserProfile.Page
            label="Billing"
            url="billing"
            labelIcon={<CreditCard className="h-4 w-4" />}
          >
            <BillingTab />
          </ClerkUserProfile.Page>
          <ClerkUserProfile.Page
            label="Preferences"
            url="preferences"
            labelIcon={<Sliders className="h-4 w-4" />}
          >
            <PreferencesTab />
          </ClerkUserProfile.Page>
        </ClerkUserProfile>
      </div>
    </div>
  );
}
