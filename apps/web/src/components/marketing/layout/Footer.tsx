'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-20 bg-[#0B0F19] text-slate-400 border-t border-white/5">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-14 h-14 overflow-hidden flex items-center justify-center">
                <img src="/logo.jpg" alt="Solis" className="w-full h-full object-contain rounded-xl" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">MeetSolis</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The AI memory layer for client-facing freelancers. Never miss a detail again.
            </p>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#faq" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><a href="mailto:appmeetsolis@gmail.com" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Solis Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="https://x.com/SutharHarigopal" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="https://www.linkedin.com/in/harigopal-suthar-6a3372307/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="https://www.instagram.com/harigopalsuthar/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
