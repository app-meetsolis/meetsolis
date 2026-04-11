'use client';
import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Cagatayhan Kurt',
    company: 'Beew Studio',
    avatar:
      'https://framerusercontent.com/images/0lXFBbIJGCYBrVEJGP360nFZpWQ.png',
    companyLogo:
      'https://framerusercontent.com/images/uo7pBe82cUPeLRAPENo3SMdk.png',
    title: 'Boosted Workflow',
    text: "Agents helped us automate tasks we didn\'t even know we could.",
  },
  {
    name: 'Isabella Hart',
    company: 'Cloudbeam',
    avatar:
      'https://framerusercontent.com/images/jC7KwluILkhO0KHxk6qWEttOxhE.png',
    companyLogo:
      'https://framerusercontent.com/images/LHlGAle7flIiScgLeQ08uifC0Y.jpg',
    title: 'Team Productivity Win',
    text: "We were drowning in repetitive tasks before trying this. Now, our agents handle scheduling, documentation, and follow-ups automatically. It's like hiring a digital team that never sleeps — and never drops the ball.",
  },
  {
    name: 'Liam Patel',
    company: 'ScaleWise',
    avatar:
      'https://framerusercontent.com/images/mo2Pbj2hqScYdc4e7VO88ooki4.png',
    companyLogo:
      'https://framerusercontent.com/images/Z97wHoPR4AM16uZklAdSwB6nJ6A.jpg',
    title: 'Zero Setup Time',
    text: 'We launched our first agent in minutes — no devs needed at all.',
  },
  {
    name: 'Sarah Kim',
    company: 'Launchlane',
    avatar:
      'https://framerusercontent.com/images/FVjwWr85ut7DBy7LiAzsJoNMlLM.png',
    companyLogo:
      'https://framerusercontent.com/images/gAUQNWE2ieb3AkWbl2BVydSZ4.jpg',
    title: 'Team Productivity Win',
    text: 'Our team saves hours every week thanks to the AI agent automation.',
  },
  {
    name: 'David Chen',
    company: 'Optiq Systems',
    avatar:
      'https://framerusercontent.com/images/GsvGVDjt9Og2l8MpVzjNi5xbrS0.png',
    companyLogo:
      'https://framerusercontent.com/images/s3HxTxIdMTiELxUawIHiiQXns.jpg',
    title: 'Massive Time Saver',
    text: 'Cut our manual task load in half within the first two weeks.',
  },
  {
    name: 'Ethan Moore',
    company: 'SignalCraft',
    avatar:
      'https://framerusercontent.com/images/x9G5jXfdPxE5I5HJgcvxyjtJudc.png',
    companyLogo:
      'https://framerusercontent.com/images/tZNhsS3z1h21O8MBufIOJ5kxZhU.jpg',
    title: 'Huge ROI',
    text: "This AI agent system saved us weeks of manual effort in our first month alone. It's not just automation — it's clarity, structure, and real productivity gains baked into our day-to-day operations.",
  },
  {
    name: 'Ana Moretti',
    company: 'Brightlabs',
    avatar:
      'https://framerusercontent.com/images/E3vzjdpFuSWiVeurdyPGMrSWk.png',
    companyLogo:
      'https://framerusercontent.com/images/k3DYExJloLpyuH8vw9JInbj0oZw.jpg',
    title: 'Effortless Integration',
    text: 'We connected all our tools seamlessly and started automating immediately.',
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <div
      className="testimonial-card"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgb(233,235,239)',
        borderRadius: '12px',
        boxShadow: 'rgba(119,126,150,0.1) 0px 10px 20px -5px',
        backdropFilter: 'blur(10px)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '90px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={36}
              height={36}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div>
            <h5
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#000000',
                lineHeight: '1em',
              }}
            >
              {testimonial.name}
            </h5>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.7)',
                lineHeight: '1.5em',
              }}
            >
              {testimonial.company}
            </p>
          </div>
        </div>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '100px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={testimonial.companyLogo}
            alt={testimonial.company}
            width={24}
            height={24}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgb(233,235,239)' }} />
      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h5
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#000000',
            lineHeight: '1em',
          }}
        >
          {testimonial.title}
        </h5>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.7)',
            letterSpacing: '-0.02em',
            lineHeight: '1.5em',
          }}
        >
          {testimonial.text}
        </p>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      className="w-full flex flex-col items-center relative"
      style={{ padding: '64px', backgroundColor: 'rgb(248,249,250)' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          mask: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.3) 52%, rgba(0,0,0,0) 100%)',
          WebkitMask:
            'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.3) 52%, rgba(0,0,0,0) 100%)',
          zIndex: 0,
        }}
      >
        <Image
          src="https://framerusercontent.com/images/uXlN676xpS6K44HuJ2TIBzyRbg.png"
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="w-full max-w-[1000px] flex flex-col gap-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">LOVED BY 200+ TEAMS WORLDWIDE</span>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 600,
                letterSpacing: '-3px',
                lineHeight: '1em',
                color: '#000000',
                textAlign: 'center',
              }}
            >
              What People Are Saying
            </h2>
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#000000',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            See how startups and creators are using Agent to move faster, look
            better, and convert more users.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            maskImage:
              'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 35%)',
            WebkitMaskImage:
              'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 35%)',
            overflow: 'hidden',
          }}
        >
          {/* Column 1 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <TestimonialCard testimonial={testimonials[0]} />
            <TestimonialCard testimonial={testimonials[1]} />
          </div>
          {/* Column 2 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <TestimonialCard testimonial={testimonials[2]} />
            <TestimonialCard testimonial={testimonials[3]} />
            <TestimonialCard testimonial={testimonials[4]} />
          </div>
          {/* Column 3 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <TestimonialCard testimonial={testimonials[5]} />
            <TestimonialCard testimonial={testimonials[6]} />
          </div>
        </div>
      </div>
    </section>
  );
}
