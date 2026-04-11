'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 nav-blur"
      style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid rgb(209,213,221)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 w-[250px]">
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
            {/* Logo SVG */}
            <svg
              width="102"
              height="32"
              viewBox="0 0 102 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <defs>
                  <linearGradient id="lg1" x1="0.5" x2="0.5" y1="0" y2="1">
                    <stop offset="0" stopColor="rgb(17,22,27)" />
                    <stop offset="1" stopColor="rgb(113,113,113)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 29.702 24 L 29.702 8 L 24.405 11.093 L 24.405 20.901 L 16.014 25.808 L 7.624 20.901 L 7.624 11.093 L 2.327 8 L 2.327 24 L 16.014 32 Z"
                  fill="url(#lg1)"
                />
              </g>
              <g>
                <defs>
                  <linearGradient id="lg2" x1="1" x2="0" y1="0.167" y2="0.833">
                    <stop offset="0" stopColor="rgb(11,65,34)" />
                    <stop offset="1" stopColor="rgb(34,195,100)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 29.702 8 L 24.405 4.901 L 16.014 9.808 L 7.624 4.901 L 2.327 8 L 16.014 16 Z"
                  fill="url(#lg2)"
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
                d="M 51.915 25 C 51.136 25 50.449 24.882 49.854 24.647 C 49.26 24.411 48.771 24.076 48.387 23.643 C 48.003 23.221 47.743 22.725 47.607 22.155 L 49.65 22.025 C 49.786 22.434 50.021 22.756 50.355 22.992 C 50.702 23.24 51.222 23.364 51.915 23.364 C 52.733 23.364 53.358 23.19 53.791 22.843 C 54.237 22.496 54.46 21.969 54.46 21.262 L 54.46 19.831 C 54.225 20.339 53.847 20.742 53.327 21.039 C 52.807 21.337 52.225 21.486 51.581 21.486 C 50.752 21.486 50.015 21.281 49.371 20.872 C 48.727 20.463 48.226 19.899 47.867 19.18 C 47.508 18.461 47.328 17.63 47.328 16.688 C 47.328 15.734 47.502 14.897 47.848 14.178 C 48.207 13.459 48.703 12.895 49.334 12.486 C 49.978 12.077 50.702 11.872 51.507 11.872 C 52.213 11.872 52.832 12.033 53.364 12.356 C 53.909 12.678 54.299 13.112 54.534 13.657 L 54.534 12.095 L 56.429 12.095 L 56.429 21.207 C 56.429 22.025 56.243 22.713 55.871 23.271 C 55.512 23.841 54.992 24.269 54.311 24.554 C 53.643 24.851 52.844 25 51.915 25 Z"
                fill="rgb(0,0,0)"
              />
              <path
                d="M 62.829 22.211 C 61.864 22.211 61.028 22 60.322 21.579 C 59.629 21.157 59.09 20.556 58.707 19.775 C 58.335 18.994 58.149 18.083 58.149 17.041 C 58.149 16 58.335 15.095 58.707 14.327 C 59.09 13.546 59.629 12.944 60.322 12.523 C 61.015 12.089 61.833 11.872 62.774 11.872 C 63.665 11.872 64.451 12.083 65.132 12.504 C 65.813 12.913 66.339 13.508 66.711 14.289 C 67.095 15.07 67.286 16.012 67.286 17.116 L 67.286 17.618 L 60.192 17.618 C 60.242 18.585 60.495 19.31 60.954 19.793 C 61.424 20.277 62.055 20.519 62.848 20.519 C 63.43 20.519 63.913 20.382 64.297 20.11 C 64.68 19.837 64.947 19.471 65.095 19.012 L 67.138 19.143 C 66.878 20.06 66.364 20.804 65.597 21.374 C 64.841 21.932 63.919 22.211 62.829 22.211 Z"
                fill="rgb(0,0,0)"
              />
              <path
                d="M 69.003 21.988 L 69.003 12.095 L 70.804 12.095 L 70.879 14.736 L 70.637 14.605 C 70.748 13.961 70.959 13.44 71.268 13.044 C 71.578 12.647 71.956 12.356 72.401 12.17 C 72.847 11.971 73.33 11.872 73.85 11.872 C 74.593 11.872 75.206 12.039 75.688 12.374 C 76.184 12.696 76.555 13.143 76.803 13.713 C 77.063 14.271 77.193 14.909 77.193 15.628 L 77.193 21.988 L 75.224 21.988 L 75.224 16.223 C 75.224 15.641 75.162 15.151 75.038 14.754 C 74.915 14.358 74.71 14.054 74.426 13.843 C 74.141 13.632 73.769 13.527 73.311 13.527 C 72.618 13.527 72.055 13.756 71.621 14.215 C 71.188 14.674 70.971 15.343 70.971 16.223 L 70.971 21.988 Z"
                fill="rgb(0,0,0)"
              />
              <path
                d="M 82.778 21.988 C 81.837 21.988 81.144 21.771 80.698 21.337 C 80.252 20.903 80.029 20.227 80.029 19.31 L 80.029 9.771 L 81.998 9.771 L 81.998 19.161 C 81.998 19.62 82.097 19.936 82.295 20.11 C 82.493 20.283 82.797 20.37 83.205 20.37 L 84.617 20.37 L 84.617 21.988 Z"
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

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-0">
          <Link
            href="/"
            className="px-3.5 py-3.5 text-sm font-medium text-[#4e5b6d] hover:text-black transition-colors"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Home
          </Link>
          <Link
            href="/#core-value"
            className="px-3.5 py-3.5 text-sm font-medium text-[#4e5b6d] hover:text-black transition-colors"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Features
          </Link>
          <Link
            href="/#integrations"
            className="px-3.5 py-3.5 text-sm font-medium text-[#4e5b6d] hover:text-black transition-colors"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Integrations
          </Link>
          <Link
            href="#"
            className="px-3.5 py-3.5 text-sm font-medium text-[#4e5b6d] hover:text-black transition-colors"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: '1.5em',
            }}
          >
            Pricing
          </Link>
          <div className="w-px h-8 bg-[#d1d5dd] mx-1" />
          <button
            className="px-3.5 py-3.5 text-sm font-medium text-[#4e5b6d] hover:text-black transition-colors flex items-center gap-2"
            style={{ fontSize: '16px', fontWeight: 500 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
            </svg>
            All Pages
          </button>
        </div>

        {/* CTA Button */}
        <a
          href="https://createui.lemonsqueezy.com/buy/18c10c60-2f50-40eb-9e38-7eba02bf2e5e"
          target="_blank"
          rel="noopener"
          className="btn-dark hidden md:flex"
          style={{ padding: '14px 20px', fontSize: '16px', fontWeight: 500 }}
        >
          Buy Template
        </a>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#e9ebef] px-6 py-4 flex flex-col gap-2">
          <Link
            href="/"
            className="py-3 text-base font-medium text-[#4e5b6d]"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/#core-value"
            className="py-3 text-base font-medium text-[#4e5b6d]"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#integrations"
            className="py-3 text-base font-medium text-[#4e5b6d]"
            onClick={() => setMobileOpen(false)}
          >
            Integrations
          </Link>
          <Link
            href="#"
            className="py-3 text-base font-medium text-[#4e5b6d]"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <a
            href="https://createui.lemonsqueezy.com/buy/18c10c60-2f50-40eb-9e38-7eba02bf2e5e"
            target="_blank"
            rel="noopener"
            className="btn-dark mt-2 text-center"
          >
            Buy Template
          </a>
        </div>
      )}
    </nav>
  );
}
