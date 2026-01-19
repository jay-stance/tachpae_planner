'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useEvent } from '@/context/EventContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Hero({ onStart }: { onStart: () => void }) {
  const { event } = useEvent();
  const router = useRouter(); // Import needed

  const handleProposalClick = () => {
    router.push('/proposal/create');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#fecdd3,transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_50%_-20%,#ffe4e6,transparent_70%)] opacity-70" />
      
      {/* Floating Particles */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] w-32 h-32 bg-red-300/20 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[30%] right-[10%] w-64 h-64 bg-pink-400/10 rounded-full blur-3xl" 
      />

      <div className="container relative z-10 px-4 text-center">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 backdrop-blur-md border border-pink-100 shadow-sm mb-8 hover:shadow-md transition-all cursor-default"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent uppercase">
            {event?.name ? `${event.name} Edition` : 'Curate Your Perfect Moment'}
          </span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-gray-900 drop-shadow-sm">
          <motion.span 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.8 }}
             className="block text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600"
          >
            Make this Val
          </motion.span>
          <motion.span 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
             className="block bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-red-500 pb-4"
          >
             Unforgettable
          </motion.span>
        </h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Create surprise packages, book romantic dates, and send digital love notes. <span className="font-medium text-gray-900">All in one place.</span>
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="rounded-full text-base md:text-lg h-12 md:h-16 px-6 md:px-10 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-red-200 hover:shadow-red-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full sm:w-auto" 
            onClick={onStart}
          >
            Start Planning <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full text-base md:text-lg h-12 md:h-16 px-6 md:px-10 bg-white/60 backdrop-blur-sm border-2 border-white hover:bg-white hover:border-pink-200 hover:text-pink-600 shadow-lg shadow-gray-100 hover:shadow-pink-100 transition-all duration-300 cursor-pointer w-full sm:w-auto"
            onClick={handleProposalClick}
          >
            Send "Be My Val" Link
          </Button>
        </motion.div>
      </div>

      {/* Trust Badge / Social Proof Mock */}
      <div className="absolute bottom-8 text-center text-sm text-gray-400 font-medium tracking-widest uppercase opacity-60">
        Trusted by 5,000+ Lovers across 4 Cities
      </div>
    </div>
  );
}
