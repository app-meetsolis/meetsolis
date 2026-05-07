'use client';
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { name: 'Features', link: '/#core-value' },
  { name: 'Integrations', link: '/#integrations' },
  { name: 'Pricing', link: '/pricing' },
];

const Logo = () => (
  <Link href="/" className="relative z-20 flex items-center gap-2.5 mr-4">
    <Image
      src="/images/logo-mark.jpg"
      alt="MeetSolis logo"
      width={32}
      height={32}
      style={{ borderRadius: '6px' }}
    />
    <span
      style={{
        fontSize: '17px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#d9f0e5',
        fontFamily: 'var(--font-outfit)',
        lineHeight: 1,
      }}
    >
      MeetSolis
    </span>
  </Link>
);

export default function SiteNavbar() {
  const [visible, setVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', latest => {
    setVisible(latest > 80);
  });

  return (
    <Navbar>
      {/* Desktop — hidden below lg */}
      <div className="hidden lg:block">
        <NavBody visible={visible}>
          <Logo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-3">
            <NavbarButton variant="secondary" as={Link} href="/sign-in">
              Log in
            </NavbarButton>
            <NavbarButton variant="dark" as={Link} href="/sign-up">
              Start Free
            </NavbarButton>
          </div>
        </NavBody>
      </div>

      {/* Mobile — hidden at lg and above */}
      <div className="lg:hidden">
        <MobileNav visible={visible}>
          <MobileNavHeader>
            <Logo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#9abfad] font-medium text-base hover:text-[#d9f0e5] transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex w-full flex-col gap-3 pt-2 border-t border-gray-100">
              <NavbarButton
                variant="primary"
                as={Link}
                href="/sign-in"
                className="w-full text-center"
              >
                Log in
              </NavbarButton>
              <NavbarButton
                variant="dark"
                as={Link}
                href="/sign-up"
                className="w-full text-center"
              >
                Start Free
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </div>
    </Navbar>
  );
}
