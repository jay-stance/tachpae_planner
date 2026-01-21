'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Twitter, MessageCircle } from 'lucide-react';

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
              href="https://instagram.com/tachpae" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Instagram className="w-5 h-5 text-white/70" />
            </Link>
            <Link 
              href="https://twitter.com/tachpae" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Twitter className="w-5 h-5 text-white/70" />
            </Link>
            <Link 
              href="https://wa.me/2348000000000" 
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
