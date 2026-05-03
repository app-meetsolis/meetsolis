'use client';
import React, { useRef, useEffect, useState } from 'react';

interface FeatureCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  index: number;
  visible: boolean;
}

function FeatureCard({
  imageSrc,
  imageAlt,
  title,
  description,
  index,
  visible,
}: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-4 w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1)'
          : 'translateY(44px) scale(0.97)',
        filter: visible ? 'blur(0px)' : 'blur(8px)',
        transition: `opacity 0.75s ease, transform 0.75s ease, filter 0.75s ease`,
        transitionDelay: `${index * 0.18}s`,
      }}
    >
      <div
        className="w-full overflow-hidden rounded-lg"
        style={{ height: '400px', position: 'relative' }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '40%',
            background:
              'linear-gradient(to top, rgba(11,22,18,0.9) 0%, transparent 100%)',
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#d9f0e5',
            margin: 0,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#b8c5bf',
            lineHeight: '1.4em',
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

const features = [
  {
    imageSrc:
      'https://framerusercontent.com/images/mIXJBBCw9XRU79ccBf8G6ntki5w.jpg',
    imageAlt:
      'AI Contract Review interface showing document analysis and risk detection',
    title: 'AI Contract Review',
    description:
      'Instantly detect risks, missing clauses, and inconsistencies, powered by legal-grade AI.',
  },
  {
    imageSrc:
      'https://framerusercontent.com/images/W5RhuUChCi7brzQ56RmT3A1fB6c.jpg',
    imageAlt:
      'Drafting Automation interface showing AI-assisted contract template generation',
    title: 'Drafting Automation',
    description:
      'Generate and edit contracts in minutes with AI-assisted templates tailored to your needs.',
  },
  {
    imageSrc:
      'https://framerusercontent.com/images/cUm9ZTptW386ZXA75oi9ggiMMz4.jpg',
    imageAlt:
      'Compliance Insights dashboard showing regulatory alignment checks and audit trails',
    title: 'Compliance Insights',
    description:
      'Ensure regulatory alignment with automated checks and clear audit trails.',
  },
];

export default function NoveraFeaturesOverview() {
  const [visible, setVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features-overview"
      className="w-full"
      style={{ backgroundColor: '#0b1612' }}
    >
      <div className="max-w-[1248px] mx-auto px-6 py-12 pb-32">
        <div className="flex flex-col gap-4 max-w-[480px] mb-12">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-2 rounded-full"
              style={{ backgroundColor: '#1a6b42' }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#b8c5bf',
              }}
            >
              Core Capabilities
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Petrona, serif',
              fontSize: 'clamp(32px, 3.5vw, 40px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: '1.1em',
              color: '#d9f0e5',
              margin: 0,
            }}
          >
            Smarter tools for faster, safer legal work.
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '1.4em',
              color: '#b8c5bf',
              margin: 0,
            }}
          >
            Streamline your workflow with intelligent features designed to make
            every contract more accurate, compliant, and effortless.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
