'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Package, Heart, Truck, CheckCircle, ArrowRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { 
    icon: Gift, 
    title: "Choose Your Gifts", 
    desc: "Browse our curated selection of gifts, bundles, and experiences. Pick what speaks to your heart.",
    detail: "From flower bouquets to custom hampers, money bouquets to romantic dinners - we've got it all.",
    color: "#e11d48"
  },
  { 
    icon: Package, 
    title: "We Curate & Package", 
    desc: "Our team handles everything - premium packaging, personalization, and quality checks.",
    detail: "Add a custom message, photos, or even your own items. We make it picture-perfect.",
    color: "#8b5cf6"
  },
  { 
    icon: Truck, 
    title: "Guaranteed Delivery", 
    desc: "We deliver on your chosen date, guaranteed. Track in real-time via WhatsApp.",
    detail: "Delivery available in Lagos, Ibadan, Port Harcourt & Abeokuta. February 14th slots filling fast!",
    color: "#0ea5e9"
  },
  { 
    icon: Heart, 
    title: "They Experience Magic", 
    desc: "Your Valentine receives an unforgettable surprise. Pure joy, no stress for you.",
    detail: "10,000+ couples have trusted us. Join them this Valentine's season!",
    color: "#ec4899"
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <section className="relative z-20 py-16 md:py-24 px-4" style={{ background: 'linear-gradient(180deg, #050511 0%, #0a0a1a 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white mb-4"
          >
            How <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}>Tachpae</span> Works
          </motion.h2>
          <p className="text-white/60 max-w-xl mx-auto">
            We make Valentine's stress-free. Here's your journey from idea to unforgettable moment.
          </p>
        </div>

        {/* Interactive Steps Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left: Step Navigation */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <motion.button
                  key={idx}
                  onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                  className={`w-full p-4 md:p-6 rounded-2xl border text-left transition-all duration-300 ${
                    isActive 
                      ? 'border-white/20 bg-white/10 scale-[1.02]' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive ? 'scale-110' : 'opacity-50'
                      }`}
                      style={{ background: isActive ? step.color : 'rgba(255,255,255,0.1)' }}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/40">STEP {idx + 1}</span>
                        {isActive && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: step.color }}
                          />
                        )}
                      </div>
                      <h3 className={`text-lg font-bold mb-1 transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm transition-colors ${isActive ? 'text-white/70' : 'text-white/40'}`}>
                        {step.desc}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <ArrowRight className="w-5 h-5 text-white/40" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
            
            {/* Playback Controls */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white/50 hover:text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <div className="flex-1 flex gap-1">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className="flex-1 h-1 rounded-full overflow-hidden bg-white/10"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: steps[idx].color }}
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: idx < activeStep ? '100%' : idx === activeStep ? '100%' : '0%' 
                      }}
                      transition={{ duration: idx === activeStep ? 4 : 0.3 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Active Step Detail */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl overflow-hidden p-8 md:p-12"
                style={{ background: `linear-gradient(135deg, ${steps[activeStep].color}20, ${steps[activeStep].color}05)` }}
              >
                {/* Glowing orb */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-30"
                  style={{ background: steps[activeStep].color }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: steps[activeStep].color }}
                  >
                    {React.createElement(steps[activeStep].icon, { className: "w-10 h-10 text-white" })}
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                    {steps[activeStep].title}
                  </h3>
                  
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    {steps[activeStep].detail}
                  </p>
                  
                  {/* Trust indicators per step */}
                  <div className="flex flex-wrap gap-3">
                    {activeStep === 0 && (
                      <>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">50+ Gift Options</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">Curated Bundles</span>
                      </>
                    )}
                    {activeStep === 1 && (
                      <>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">Premium Packaging</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">Custom Messages</span>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">✓ Feb 14 Guaranteed</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">4 Cities</span>
                      </>
                    )}
                    {activeStep === 3 && (
                      <>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">★ 10,000+ Couples</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">Photo Proof</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Delivery Cities Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">Lagos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">Ibadan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">Port Harcourt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-white font-medium">Abeokuta</span>
            </div>
          </div>
          <p className="text-white/50 text-sm mt-3">
            🚀 <strong className="text-white/70">Guaranteed delivery</strong> on your chosen date. Pay online, we handle everything.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
