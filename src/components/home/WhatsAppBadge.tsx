'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppBadge() {
  return (
    <Link 
      href="https://wa.me/+2347070295596" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8"
    >
      <MessageCircle className="w-8 h-8 fill-white/20" />
      <span className="absolute right-[calc(100%+12px)] bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        Need help? Chat with us!
      </span>
      {/* Notification Dot */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#25D366] animate-pulse" />
    </Link>
  );
}
