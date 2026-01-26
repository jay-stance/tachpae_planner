'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';

const DEADLINE = new Date('2026-02-14T00:00:00'); // Assuming 2026 based on context (val-2026)

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number }>({ days: 0, hours: 0, minutes: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +DEADLINE - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute to save resources

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-rose-600 text-white py-2 px-4 shadow-xl"
        style={{ background: 'linear-gradient(90deg, #e11d48 0%, #be123c 100%)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 md:gap-8 text-sm md:text-base font-medium">
           <div className="flex items-center gap-2 animate-pulse">
             <Timer className="w-4 h-4" />
             <span className="uppercase tracking-wider text-rose-100 text-xs md:text-sm font-bold">Valentine's Deadline</span>
           </div>
           
           <div className="flex items-center gap-4 font-mono font-bold">
              <div className="text-center">
                 <span className="text-lg md:text-xl leading-none">{timeLeft.days}</span>
                 <span className="text-[10px] text-rose-200 block -mt-1">DAYS</span>
              </div>
              <span className="opacity-50">:</span>
              <div className="text-center">
                 <span className="text-lg md:text-xl leading-none">{timeLeft.hours}</span>
                 <span className="text-[10px] text-rose-200 block -mt-1">HRS</span>
              </div>
              <span className="opacity-50 hidden md:inline">:</span>
              <div className="text-center hidden md:block">
                 <span className="text-lg md:text-xl leading-none">{timeLeft.minutes}</span>
                 <span className="text-[10px] text-rose-200 block -mt-1">MINS</span>
              </div>
           </div>

           <span className="hidden md:inline text-rose-100 text-sm">Order now to guarantee delivery.</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
