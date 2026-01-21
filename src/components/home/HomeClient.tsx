'use client';

import React, { useState } from 'react';
import { ICity } from '@/models/City';
import Hero from './Hero';
import CitySelector from './CitySelector';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function HomeClient({ cities }: { cities: ICity[] }) {
  const router = useRouter();
  const [showCitySelector, setShowCitySelector] = useState(false);

  const handleStart = () => {
    setShowCitySelector(true);
  };

  const handleCitySelect = (cityId: string) => {
    // Find the city object to get the slug? 
    // Ideally the CitySelector returns the ID, but we might want the slug for the URL.
    // Let's assume for now we find it here.
    const city = cities.find(c => (c._id as unknown as string) === cityId);
    if (city) {
        router.push(`/planning/${city.slug}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen min-w-full">
      <Header className="absolute top-0 left-0 right-0 z-50" variant="dark" />
      <Hero onStart={handleStart} />
      
      {/* We can add more sections here like "How it works", "Featured", etc. */}
      
      {showCitySelector && (
        <CitySelector cities={cities} onSelect={handleCitySelect} />
      )}
    </div>
  );
}
