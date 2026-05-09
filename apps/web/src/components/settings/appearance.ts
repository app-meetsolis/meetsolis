import type { Appearance } from '@clerk/types';

function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function buildAppearance(): Appearance {
  return {
    variables: {
      colorBackground: cssVar('--background') || '#ffffff',
      colorText: cssVar('--foreground'),
      colorPrimary: cssVar('--primary'),
      colorTextOnPrimaryBackground: cssVar('--primary-foreground'),
      colorTextSecondary: cssVar('--muted-foreground'),
      colorDanger: cssVar('--destructive'),
      colorInputBackground: cssVar('--background'),
      colorInputText: cssVar('--foreground'),
      colorNeutral: cssVar('--muted-foreground'),
      borderRadius: '8px',
      fontFamily: 'inherit',
      fontSize: '13px',
    },
    elements: {
      // Hide Clerk's internal sidebar — we use our own tab nav
      navbar: { display: 'none' },
      navbarMobileMenuRow: { display: 'none' },
      navbarMobileMenuButton: { display: 'none' },
      // Hide the "Secured by Clerk" dev badge
      badge: { display: 'none' },
      // Flatten the card — no shadow, no border, transparent bg
      rootBox: { width: '100%' },
      cardBox: {
        width: '100%',
        boxShadow: 'none',
        border: 'none',
        background: 'transparent',
      },
      card: {
        boxShadow: 'none',
        border: 'none',
        background: 'transparent',
        width: '100%',
        overflow: 'visible',
      },
      pageScrollBox: {
        padding: '24px 0 32px',
        background: 'transparent',
        width: '100%',
      },
      // Form elements
      formButtonPrimary: {
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
      },
      formButtonReset: { fontSize: '13px' },
      formFieldInput: { borderRadius: '8px', fontSize: '13px' },
      formFieldLabel: { fontSize: '13px', fontWeight: '500' },
      formFieldHintText: { fontSize: '12px' },
      formFieldErrorText: { fontSize: '12px' },
      // Header
      headerTitle: {
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '-0.02em',
      },
      headerSubtitle: { fontSize: '13px' },
      profileSectionTitleText: { fontSize: '15px', fontWeight: '600' },
      profileSectionPrimaryButton: { fontSize: '13px' },
      // Dividers
      dividerText: { fontSize: '12px' },
      // Accordion / list items
      accordionTriggerButton: { fontSize: '13px' },
      // Social buttons
      socialButtonsBlockButton: { borderRadius: '8px', fontSize: '13px' },
      alternativeMethodsBlockButton: { borderRadius: '8px', fontSize: '13px' },
    },
  };
}
