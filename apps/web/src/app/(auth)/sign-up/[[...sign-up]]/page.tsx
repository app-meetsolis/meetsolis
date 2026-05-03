import { SignUp } from '@clerk/nextjs';
import ClerkBadgeKill from '@/components/auth/ClerkBadgeKill';

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-5">
      <ClerkBadgeKill />

      <div>
        <h1
          className="text-white font-semibold"
          style={{ fontSize: '1.6rem', letterSpacing: '-0.02em' }}
        >
          Create your account
        </h1>
        <p className="mt-1 text-white/40 text-[13px]">
          Start your free trial today.
        </p>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#37ea9e',
            colorText: '#ffffff',
            colorTextSecondary: 'rgba(255,255,255,0.45)',
            colorBackground: 'transparent',
            colorInputBackground: 'rgba(255,255,255,0.06)',
            colorInputText: '#ffffff',
            colorNeutral: '#ffffff',
            borderRadius: '8px',
            fontFamily: 'inherit',
            fontSize: '14px',
          },
          elements: {
            rootBox: '!w-full',
            cardBox: '!w-full !shadow-none',
            card: '!bg-transparent !shadow-none !border-0 !w-full',
            header: '!hidden',
            badge: '!hidden',
            logoBox: '!hidden',
            socialButtonsRoot: '!flex !flex-col !gap-2',
            socialButtonsBlockButton:
              '!border-white/10 !bg-white/8 !text-white hover:!bg-white/[0.14] !w-full',
            socialButtonsBlockButtonText: '!text-white',
            dividerLine: '!bg-white/15',
            dividerText: '!text-white/40',
            formFieldLabel: '!text-white/50',
            formFieldInput:
              '!bg-white/6 !border-white/10 placeholder:!text-white/25 focus:!border-[#37ea9e]/50',
            formButtonPrimary:
              '!bg-[#37ea9e] !text-[#070B12] !font-semibold hover:!opacity-90',
            footerAction: '!hidden',
            footer: '!hidden',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/onboarding"
      />
    </div>
  );
}
