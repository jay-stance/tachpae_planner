'use client';

import { IEvent } from '@/models/Event';
import React, { createContext, useContext, useEffect } from 'react';

interface EventContextType {
  event: IEvent | null;
  currentCity: string | null;
  setCity: (cityId: string) => void;
}

const EventContext = createContext<EventContextType>({
  event: null,
  currentCity: null,
  setCity: () => {},
});

export const useEvent = () => useContext(EventContext);

interface EventProviderProps {
  children: React.ReactNode;
  initialEvent: IEvent | null;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children, initialEvent }) => {
  const [event] = React.useState<IEvent | null>(initialEvent);
  const [currentCity, setCurrentCity] = React.useState<string | null>(null);

  // Apply Theme Variables
  useEffect(() => {
    if (event && event.themeConfig) {
      const root = document.documentElement;
      
      // We assume hex codes are provided. 
      // A more robust solution would convert hex to HSL/RGB for Tailwind opacity modifiers
      // For now, we set them directly.
      if (event.themeConfig.primaryColor) {
        root.style.setProperty('--primary', event.themeConfig.primaryColor);
        // Fallback for shadcn HSL usage - this is a simplification. 
        // Ideally we convert the hex to HSL values here.
      }
      if (event.themeConfig.secondaryColor) {
        root.style.setProperty('--secondary', event.themeConfig.secondaryColor);
        root.style.setProperty('--muted', event.themeConfig.secondaryColor);
      }
      if (event.themeConfig.fontFamily) {
        root.style.setProperty('--font-sans', event.themeConfig.fontFamily);
      }
    }
  }, [event]);

  return (
    <EventContext.Provider value={{ event, currentCity, setCity: setCurrentCity }}>
      {/* We can add a global event wrapper div here if needed */}
      {children}
    </EventContext.Provider>
  );
};
