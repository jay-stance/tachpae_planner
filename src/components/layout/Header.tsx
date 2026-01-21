'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Header({ className = '', variant = 'dark' }: HeaderProps) {
  const isLight = variant === 'light';
  
  return (
    <header className={`w-full py-4 px-4 ${className} mx-auto`}>
      <div className="mx-auto container px-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="https://www.tachpae.com/assets/logo-CR8FPQ-p.png" 
            alt="Tachpae Logo" 
            width={36} 
            height={36}
            className="object-contain group-hover:scale-105 transition-transform"
          />
          <span className={`text-xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Tachpae
          </span>
        </Link>
      </div>
    </header>
  );
}
