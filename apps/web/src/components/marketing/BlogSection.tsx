'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const articles = [
  {
    title: 'Building Smarter Workflows with AI Agents',
    category: 'Automation',
    readTime: '1 mins read',
    image:
      'https://framerusercontent.com/images/vNpRxywaxh8PX6CfUU4M3OFbnc.png',
    href: '#',
  },
  {
    title: 'Why Multi-Agent Systems Are the Future',
    category: 'Insights',
    readTime: '3 mins read',
    image:
      'https://framerusercontent.com/images/WVUPQQBwJeyznwFa7fAylcQlofs.jpg',
    href: '#',
  },
  {
    title: 'How to Automate Tasks in Under 5 Minutes',
    category: 'How-To',
    readTime: '2 mins read',
    image:
      'https://framerusercontent.com/images/7uzX8mmXLLg62cg2wYR9szGPrw.png',
    href: '#',
  },
];

export default function BlogSection() {
  return (
    <section
      className="w-full flex flex-col items-center"
      id="blog"
      style={{ padding: '64px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1000px] flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="section-badge">OUR BLOG</span>
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
              Review our latest articles
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
            Do you want to learn more about us, let&apos;s go the blog page.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          {articles?.map((article, i) => (
            <Link
              key={i}
              href={article?.href}
              className="flex-1 min-w-[280px]"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="blog-card h-full"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgb(228,228,228)',
                  borderRadius: '20px',
                  boxShadow: 'rgba(0,0,0,0.05) 0px 2px 2px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: '250px',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    margin: '8px',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={article?.image}
                    alt={article?.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                {/* Content */}
                <div
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.5em',
                    }}
                  >
                    {article?.title}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: '#000000',
                      }}
                    >
                      {article?.category}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgb(78,91,109)',
                      }}
                    >
                      {article?.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <a href="#" className="btn-dark" style={{ padding: '14px 20px' }}>
            See All Blogs
          </a>
        </div>
      </div>
    </section>
  );
}
