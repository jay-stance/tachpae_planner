'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useEvent } from '@/context/EventContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Hero({ onStart }: { onStart: () => void }) {
  const { event } = useEvent();
  const router = useRouter();

  const handleProposalClick = () => {
    router.push('/proposal/create');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--tachpae-bg-dark)' }}>
      {/* Dynamic Background Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" 
        style={{ background: 'var(--tachpae-primary)', opacity: 0.3 }}
      />
      <motion.div 
        animate={{ y: [0, 40, 0], opacity: [0.2, 0.4, 0.2] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" 
        style={{ background: 'var(--tachpae-secondary)', opacity: 0.25 }}
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none" 
        style={{ background: 'var(--tachpae-accent)', opacity: 0.2 }}
      />

      <div className="container relative z-10 px-5 text-center">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border backdrop-blur-md shadow-lg mb-8 hover:shadow-xl transition-all cursor-default"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'rgba(255, 255, 255, 0.1)' 
            }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--tachpae-secondary)' }} />
          <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">
            {event?.name ? `${event.name} Edition` : 'The Ultimate Experience'}
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
          <motion.span 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.8 }}
             className="block text-white"
          >
            Make This Valentine
          </motion.span>
          <motion.span 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
             className="block bg-clip-text text-transparent pb-2"
             style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary) 0%, var(--tachpae-secondary) 100%)' }}
          >
             Easy & Unforgettable.
          </motion.span>
        </h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-medium"
        >
          Plan Less. Celebrate More.
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="rounded-full text-base md:text-lg h-12 md:h-14 px-8 md:px-10 text-white shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-[85%] md:w-full sm:w-auto border-0" 
            style={{ 
              background: 'linear-gradient(135deg, var(--tachpae-primary) 0%, var(--tachpae-primary-light) 100%)',
              boxShadow: '0 8px 32px rgba(53, 20, 245, 0.4)'
            }}
            onClick={onStart}
          >
            <Sparkles className="mr-2 w-4 h-4" /> Start Planning
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full text-base md:text-lg h-12 md:h-14 px-8 md:px-10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-[85%] md:w-full sm:w-auto group"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white'
            }}
            onClick={handleProposalClick}
          >
            Send Be My Val Link <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Trust Badge */}
      <div className="absolute bottom-8 text-center text-sm text-white/30 font-medium tracking-widest uppercase">
        Trusted by 5,000+ Celebrants across 4 Cities
      </div>
    </div>
  );
}
