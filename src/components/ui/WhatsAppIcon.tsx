'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useEvent } from '@/context/EventContext';
import { trackContact } from '@/lib/metaPixel';

export default function WhatsAppIcon() {
  const { event } = useEvent();
  const primaryColor = event?.themeConfig?.primaryColor || '#25D366'; // Default WhatsApp green if no primary

  const handleClick = () => {
    trackContact('whatsapp_floating_icon');
  };

  return (
    <a
      href="https://wa.me/+2347070295596"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 group"
      style={{ backgroundColor: '#25D366' }}
      aria-label="Contact us on WhatsApp"
      onClick={handleClick}
    >
      <div className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none" style={{ backgroundColor: '#25D366' }} />
      <MessageCircle className="w-7 h-7 fill-white" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border">
        Need help? Chat with us!
      </div>
    </a>
  );
}

