'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Truck, Heart } from 'lucide-react';
import ConversionModal from './ConversionModal';

interface CityTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  cityName: string;
}

/**
 * City Trust Modal
 * Shown: After city selection on first visit only
 * Purpose: Build trust immediately
 */
export default function CityTrustModal({
  isOpen,
  onClose,
  onDismiss,
  cityName,
}: CityTrustModalProps) {
  return (
    <ConversionModal isOpen={isOpen} onClose={onClose} onDismiss={onDismiss}>
      <div className="text-center space-y-5 pt-2">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-rose-600" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            Great news! We deliver to {cityName} 💜
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Everything you see here will be delivered on Feb 14 — that's our promise!
          </p>
        </div>

        {/* Trust Points */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-left p-3 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-bold text-green-800">All items available in {cityName}</span>
          </div>
          <div className="flex items-center gap-3 text-left p-3 bg-rose-50 rounded-xl border border-rose-100">
            <Truck className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="text-sm font-bold text-rose-800">Guaranteed Valentine delivery</span>
          </div>
          <div className="flex items-center gap-3 text-left p-3 bg-purple-50 rounded-xl border border-purple-100">
            <Heart className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-bold text-purple-800">Trusted by 10,000+ couples</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onClose}
          className="w-full h-14 text-lg rounded-2xl bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-200"
        >
          Start Browsing 🎁
        </Button>
      </div>
    </ConversionModal>
  );
}
