import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex">
      {/* ── LEFT: full-bleed dark panel with real mountain image ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/auth-mountain.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-[#0b1612]/60" />

        {/* Content sits above the image */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-ms.png"
              alt="MeetSolis"
              width={38}
              height={38}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                fontFamily: 'var(--font-outfit)',
                lineHeight: 1,
              }}
            >
              MeetSolis
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Tagline — bottom-anchored */}
          <div className="pb-10">
            <h2
              className="text-4xl xl:text-[44px] leading-[1.1]"
              style={{
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.01em',
              }}
            >
              <span className="text-white">
                Your clients&apos; breakthroughs.
              </span>
              <br />
              <span className="text-[#37ea9e]">Always remembered.</span>
            </h2>
            <p className="mt-4 text-white/50 text-[13px] leading-relaxed max-w-xs">
              For professionals who turn every client conversation into lasting
              value.
            </p>
            <p className="mt-6 text-white/25 text-[11px]">
              © {new Date().getFullYear()} MeetSolis. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: cream form panel ── */}
      <div className="w-full lg:w-1/2 bg-[#070B12] flex flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between px-10 py-7">
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 lg:invisible">
            <Image
              src="/images/logo-ms.png"
              alt="MeetSolis"
              width={26}
              height={26}
            />
            <span
              style={{
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                fontFamily: 'var(--font-outfit)',
                lineHeight: 1,
              }}
            >
              MeetSolis
            </span>
          </div>
        </div>

        {/* Form — centred */}
        <div className="flex flex-1 items-center justify-center px-8 pb-10">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
