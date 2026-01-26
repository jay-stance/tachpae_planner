'use client';

import React, { useState } from 'react';
import { ICity } from '@/models/City';
import Hero from './Hero';
import CitySelector from './CitySelector';
import HowItWorks from './HowItWorks';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

import WhatsAppBadge from './WhatsAppBadge';
import CountdownTimer from './CountdownTimer';

export default function HomeClient({ cities }: { cities: ICity[] }) {
  const router = useRouter();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStart = () => {
    setShowCitySelector(true);
  };

  const handleCitySelect = (cityId: string) => {
    const city = cities.find(c => (c._id as unknown as string) === cityId);
    if (city) {
        setIsNavigating(true);
        router.push(`/planning/${city.slug}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen min-w-full bg-gray-950">
      <CountdownTimer />
      <Header className="absolute top-[40px] left-0 right-0 z-50" variant="dark" />
      <Hero onStart={handleStart} />
      
      {/* Interactive How It Works Section */}
      <HowItWorks />

      <WhatsAppBadge />
      
      {showCitySelector && (
        <CitySelector cities={cities} onSelect={handleCitySelect} />
      )}
      
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-4">
             <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-rose-600 animate-spin mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Entering the Magic...</h3>
             <p className="text-white/60 text-sm">Preparing your personalized experience</p>
        </div>
      )}
    </div>
  );
}
