'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="w-full flex flex-col items-center"
      style={{ padding: '64px 64px 48px', backgroundColor: 'rgb(248,249,250)' }}
    >
      <div className="w-full max-w-[1200px] flex flex-col gap-9">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left: Brand + Social */}
          <div
            className="flex flex-col justify-between gap-6"
            style={{ minHeight: '248px' }}
          >
            {/* Brand */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-1.5 relative">
                <div
                  className="absolute -right-3 -top-1.5 px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    fontSize: '8px',
                    fontWeight: 600,
                    color: 'rgb(78,91,109)',
                  }}
                >
                  V1.0
                </div>
                <svg width="102" height="32" viewBox="0 0 102 32" fill="none">
                  <g>
                    <defs>
                      <linearGradient id="flg1" x1="0.5" x2="0.5" y1="0" y2="1">
                        <stop offset="0" stopColor="rgb(17,22,27)" />
                        <stop offset="1" stopColor="rgb(113,113,113)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 29.702 24 L 29.702 8 L 24.405 11.093 L 24.405 20.901 L 16.014 25.808 L 7.624 20.901 L 7.624 11.093 L 2.327 8 L 2.327 24 L 16.014 32 Z"
                      fill="url(#flg1)"
                    />
                  </g>
                  <g>
                    <defs>
                      <linearGradient
                        id="flg2"
                        x1="1"
                        x2="0"
                        y1="0.167"
                        y2="0.833"
                      >
                        <stop offset="0" stopColor="rgb(11,65,34)" />
                        <stop offset="1" stopColor="rgb(34,195,100)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 29.702 8 L 24.405 4.901 L 16.014 9.808 L 7.624 4.901 L 2.327 8 L 16.014 16 Z"
                      fill="url(#flg2)"
                    />
                  </g>
                  <path
                    d="M 16.014 6.187 L 21.311 3.093 L 16.014 0 L 10.717 3.093 Z"
                    fill="rgb(34,195,100)"
                  />
                  <path
                    d="M 34.757 21.988 L 39.511 8.785 L 42.055 8.785 L 46.81 21.988 L 44.674 21.988 L 43.467 18.548 L 38.081 18.548 L 36.893 21.988 Z M 38.712 16.725 L 42.854 16.725 L 40.774 10.701 Z"
                    fill="rgb(0,0,0)"
                  />
                  <path
                    d="M 86.219 21.988 L 86.219 12.095 L 88.188 12.095 L 88.188 21.988 Z"
                    fill="rgb(0,0,0)"
                  />
                  <path
                    d="M 89.247 21.988 L 92.832 16.93 L 89.396 12.095 L 91.588 12.095 L 94.02 15.647 L 96.379 12.095 L 98.626 12.095 L 95.227 16.967 L 98.775 21.988 L 96.583 21.988 L 94.039 18.213 L 91.476 21.988 Z"
                    fill="rgb(0,0,0)"
                  />
                </svg>
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {[
                {
                  href: 'https://linkedin.com/company/beewstudio',
                  icon: 'linkedin',
                },
                { href: 'https://x.com/beewstudio', icon: 'twitter' },
                { href: 'https://github.com', icon: 'github' },
                { href: 'https://stackoverflow.com/', icon: 'stackoverflow' },
              ]?.map(social => (
                <a
                  key={social?.icon}
                  href={social?.href}
                  target="_blank"
                  rel="noopener"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {social?.icon === 'linkedin' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      fill="#000000"
                    >
                      <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                    </svg>
                  )}
                  {social?.icon === 'twitter' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      fill="#000000"
                    >
                      <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z" />
                    </svg>
                  )}
                  {social?.icon === 'github' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      fill="#000000"
                    >
                      <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68Z" />
                    </svg>
                  )}
                  {social?.icon === 'stackoverflow' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="20"
                      height="20"
                      fill="#000000"
                    >
                      <path d="M216,152.09V216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152.09a8,8,0,0,1,16,0V208H200V152.09a8,8,0,0,1,16,0Zm-128,32h80a8,8,0,1,0,0-16H88a8,8,0,1,0,0,16Z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Nav Links */}
          <div className="flex gap-5">
            {/* Product */}
            <div className="flex flex-col gap-6 w-[150px]">
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#000000',
                  lineHeight: '1em',
                }}
              >
                Product
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Features', href: '/#core-value' },
                  { label: 'Pricing', href: '#' },
                ]?.map(link => (
                  <Link
                    key={link?.label}
                    href={link?.href}
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="16"
                      height="16"
                      fill="rgb(155,165,181)"
                    >
                      <path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Z" />
                    </svg>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#000000',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.5em',
                      }}
                    >
                      {link?.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* CMS */}
            <div className="flex flex-col gap-6 w-[150px]">
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#000000',
                  lineHeight: '1em',
                }}
              >
                CMS
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Blog', href: '#' },
                  { label: 'Blog Details', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Cookie Policy', href: '#' },
                ]?.map(link => (
                  <Link
                    key={link?.label}
                    href={link?.href}
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="16"
                      height="16"
                      fill="rgb(155,165,181)"
                    >
                      <path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Z" />
                    </svg>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#000000',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.5em',
                      }}
                    >
                      {link?.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Utility */}
            <div className="flex flex-col gap-6 w-[150px]">
              <h4
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#000000',
                  lineHeight: '1em',
                }}
              >
                Utility
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { label: '404', href: '#' },
                  { label: 'Changelog', href: '#' },
                  { label: 'Waitlist', href: '#' },
                  { label: 'Contact Us', href: '#' },
                ]?.map(link => (
                  <Link
                    key={link?.label}
                    href={link?.href}
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      width="16"
                      height="16"
                      fill="rgb(155,165,181)"
                    >
                      <path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Z" />
                    </svg>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#000000',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.5em',
                      }}
                    >
                      {link?.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            borderTop: '1px solid rgba(136,136,136,0.2)',
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: 'rgb(39,50,65)',
              fontFamily: 'Geist, sans-serif',
              fontWeight: 500,
              lineHeight: '1.5em',
            }}
          >
            © 2026 Agent template for Framer.
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: 'rgb(39,50,65)',
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Designed by{' '}
            <a
              href="https://x.com/createuico"
              target="_blank"
              rel="noopener"
              style={{
                color: '#000000',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Create UI™
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
