'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';

// TikTok icon (not in Lucide)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 mt-auto" style={{ background: 'var(--tachpae-bg-dark)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="https://www.tachpae.com/assets/logo-CR8FPQ-p.png" 
              alt="Tachpae Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">Tachpae</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link 
              href="https://www.instagram.com/tachpae" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Instagram className="w-5 h-5 text-white/70" />
            </Link>
            <Link 
              href="https://www.tiktok.com/@tachpae" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <TikTokIcon />
            </Link>
            <Link 
              href="https://wa.me/+2347070295596" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <MessageCircle className="w-5 h-5 text-white/70" />
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/40">
            © {currentYear} Tachpae. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
