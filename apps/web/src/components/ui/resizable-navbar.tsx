'use client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible: boolean;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Plain fixed wrapper — no cloneElement, no scroll logic
export const Navbar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('fixed inset-x-0 top-0 z-50 w-full', className)}>
    {children}
  </div>
);

export const NavBody = ({ children, className, visible }: NavBodyProps) => (
  <motion.div
    initial={{
      borderRadius: 9999,
      width: '80%',
      y: 12,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: 'rgb(255,255,255)',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)',
    }}
    animate={{
      borderRadius: 9999,
      width: '80%',
      y: 12,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: 'rgb(255,255,255)',
      boxShadow: visible
        ? '0 0 0 1px rgba(0,0,0,0.10), 0 8px 40px rgba(0,0,0,0.12)'
        : '0 0 0 1px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)',
    }}
    transition={{ type: 'spring', stiffness: 200, damping: 50 }}
    className={cn(
      'relative z-[60] mx-auto flex max-w-7xl flex-row items-center justify-between',
      className
    )}
  >
    {children}
  </motion.div>
);

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'absolute inset-0 flex flex-1 flex-row items-center justify-center space-x-2',
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          key={`link-${idx}`}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-[#4e5b6d] hover:text-black transition-colors"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-gray-100"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => (
  <motion.div
    initial={{
      borderRadius: 24,
      width: 'calc(100% - 32px)',
      y: 12,
      backgroundColor: 'rgb(255,255,255)',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)',
    }}
    animate={{
      borderRadius: 24,
      width: 'calc(100% - 32px)',
      y: 12,
      backgroundColor: 'rgb(255,255,255)',
      boxShadow: visible
        ? '0 0 0 1px rgba(0,0,0,0.10), 0 8px 40px rgba(0,0,0,0.12)'
        : '0 0 0 1px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)',
    }}
    transition={{ type: 'spring', stiffness: 200, damping: 50 }}
    className={cn(
      'relative z-50 mx-auto flex w-full flex-col items-center justify-between px-4 py-3',
      className
    )}
  >
    {children}
  </motion.div>
);

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => (
  <div
    className={cn(
      'flex w-full flex-row items-center justify-between',
      className
    )}
  >
    {children}
  </div>
);

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start gap-4 rounded-2xl bg-white/95 backdrop-blur-md px-6 py-6 shadow-[0_4px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(209,213,221,0.5)]',
          className
        )}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="p-1 text-black">
    {isOpen ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    )}
  </button>
);

export const NavbarButton = ({
  href,
  as: Tag = 'a',
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
} & (
  | React.ComponentPropsWithoutRef<'a'>
  | React.ComponentPropsWithoutRef<'button'>
)) => {
  const base =
    'px-4 py-2 rounded-full text-sm font-semibold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center';

  const variants = {
    primary:
      'bg-white text-black shadow-[0_0_0_1px_rgba(34,42,53,0.1),0_2px_8px_rgba(0,0,0,0.06)]',
    secondary: 'bg-transparent text-[#4e5b6d]',
    dark: 'bg-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
    gradient:
      'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]',
  };

  return (
    <Tag
      href={href}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
