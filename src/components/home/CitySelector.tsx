'use client';

import React from 'react';
import { ICity } from '@/models/City';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvent } from '@/context/EventContext';

interface CitySelectorProps {
  cities: ICity[];
  onSelect: (cityId: string) => void;
}

export default function CitySelector({ cities, onSelect }: CitySelectorProps) {
  const { setCity } = useEvent();

  const handleSelect = (id: string, name: string) => {
    setCity(id);
    onSelect(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 border-0">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Where are you celebrating?</h2>
          <p className="text-muted-foreground mb-8">Select your city to see available gifts and dates.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cities.map((city) => (
              <button
                key={city._id as unknown as string}
                onClick={() => handleSelect(city._id as unknown as string, city.name)}
                className="group relative flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <span className="font-semibold group-hover:text-primary transition-colors">{city.name}</span>
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
