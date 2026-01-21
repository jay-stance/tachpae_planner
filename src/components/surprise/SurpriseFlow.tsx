'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Sparkles, Gift, Tv, Users, Laptop, Bath } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Embedded questionnaire data (could come from server via addon)
const QUESTIONNAIRE = {
  title: "Love Starts With You",
  subtitle: "You deserve the mystery. You deserve the magic.",
  prices: [
    { label: '₦50,000', value: 50000, description: 'The Self-Care Bloom 🌸' },
    { label: '₦100,000', value: 100000, description: 'The Empress Pack 👑' },
    { label: '₦200,000', value: 200000, description: 'The Ultimate Glow Up ✨' },
    { label: '₦350,000', value: 350000, description: 'The Legend Treatment 💎' },
  ],
  heroQuestion: {
    id: 'hero-vibe',
    label: 'If you had a free Saturday, what are you doing?',
    description: 'This helps us pick your perfect hero item!',
    options: [
      { label: 'Netflix & Chill', value: 'home-comfort', icon: 'tv', resultHint: 'Cozy Box', emoji: '🍿' },
      { label: 'Out with friends', value: 'social-fashion', icon: 'users', resultHint: 'Glam Box', emoji: '💃' },
      { label: 'Working on my hustle', value: 'tech-productivity', icon: 'laptop', resultHint: 'Boss Box', emoji: '💻' },
      { label: 'Self-care day', value: 'wellness', icon: 'bath', resultHint: 'Wellness Box', emoji: '🧖‍♀️' },
    ]
  }
};

const iconMap: Record<string, React.ReactNode> = {
  tv: <Tv className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  laptop: <Laptop className="w-5 h-5" />,
  bath: <Bath className="w-5 h-5" />,
};

export default function SurpriseFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    price: 0,
    priceLabel: '',
    heroVibe: '',
    heroVibeLabel: '',
    hates: '',
    noteToSelf: ''
  });

  const handlePriceSelect = (price: number, label: string) => {
    setFormData({ ...formData, price, priceLabel: label });
    setStep(2);
  };

  const handleVibeSelect = (value: string, label: string) => {
    setFormData({ ...formData, heroVibe: value, heroVibeLabel: label });
    setStep(3);
  };

  const handleNext = () => {
    if (step === 3) {
      if (!formData.hates.trim()) return;
      setStep(4);
    } else if (step === 4) {
      handleComplete();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    const selectedPrice = QUESTIONNAIRE.prices.find(p => p.value === formData.price);
    
    addItem({
      productId: 'surprise-yourself',
      productName: `Self-Love Box (${selectedPrice?.description || formData.priceLabel})`,
      basePrice: formData.price,
      quantity: 1,
      variantSelection: {},
      customizationData: {
        isSurprise: true,
        type: 'Self-Love',
        heroVibe: formData.heroVibe,
        heroVibeLabel: formData.heroVibeLabel,
        hates: formData.hates,
        noteToSelf: formData.noteToSelf,
        priceTier: selectedPrice?.description
      },
    });

    const citySlug = searchParams.get('city') || 'abuja';
    router.push(`/planning/${citySlug}`);
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 md:p-8" style={{ background: '#050511' }}>
      {/* Background Orbs - fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'var(--tachpae-primary)', opacity: 0.2 }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'var(--tachpae-secondary)', opacity: 0.15 }} />
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'var(--tachpae-accent)', opacity: 0.1 }} />
      </div>

      <motion.div 
        className="max-w-xl w-full rounded-3xl overflow-hidden relative border border-white/10 z-10"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress Bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div 
            className="h-full"
            style={{ background: 'linear-gradient(90deg, var(--tachpae-primary), var(--tachpae-secondary))' }}
            initial={{ width: '25%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Budget Selection */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}>
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    {QUESTIONNAIRE.title.split(' ').slice(0, 2).join(' ')} <br/>
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}>
                      {QUESTIONNAIRE.title.split(' ').slice(2).join(' ')}
                    </span>
                  </h1>
                  <p className="text-white/60 font-medium">{QUESTIONNAIRE.subtitle}</p>
                </div>

                <div className="space-y-3">
                  {QUESTIONNAIRE.prices.map((p) => (
                    <motion.button
                      key={p.value}
                      onClick={() => handlePriceSelect(p.value, p.label)}
                      className="w-full p-5 rounded-2xl border border-white/10 hover:border-white/30 transition-all text-left flex justify-between items-center group"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tachpae-secondary)' }}>{p.description}</div>
                        <div className="text-2xl font-black text-white">{p.label}</div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Hero Vibe Selection */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <button onClick={handleBack} className="text-white/40 hover:text-white/70 text-sm font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h1 className="text-2xl md:text-3xl font-black text-white">{QUESTIONNAIRE.heroQuestion.label}</h1>
                  <p className="text-white/50 font-medium">{QUESTIONNAIRE.heroQuestion.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {QUESTIONNAIRE.heroQuestion.options.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleVibeSelect(opt.value, opt.label)}
                      className="p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all text-center group flex flex-col items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                      whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-4xl">{opt.emoji}</span>
                      <span className="text-white font-bold text-sm">{opt.label}</span>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: 'var(--tachpae-primary)', color: 'white' }}>
                        {opt.resultHint}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: No-Go List */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <button onClick={handleBack} className="text-white/40 hover:text-white/70 text-sm font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Your <span style={{ color: 'var(--tachpae-accent)' }}>No-Go</span> List
                  </h1>
                  <p className="text-white/50 font-medium">What should we avoid? Let us know your dislikes or allergies so we only pack what you'll love.</p>
                </div>

                <Textarea 
                  placeholder="e.g. I hate chocolates, allergic to nuts, no strong perfumes..."
                  className="min-h-[150px] rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 p-6 text-lg focus:border-white/30"
                  value={formData.hates}
                  onChange={(e) => setFormData({ ...formData, hates: e.target.value })}
                />

                <Button 
                  onClick={handleNext} 
                  disabled={!formData.hates.trim()}
                  className="w-full h-14 rounded-2xl text-white text-lg font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                >
                  Next Step <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* STEP 4: Note to Self */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <button onClick={handleBack} className="text-white/40 hover:text-white/70 text-sm font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h1 className="text-2xl md:text-3xl font-black text-white">A Note to <span style={{ color: 'var(--tachpae-secondary)' }}>Yourself</span></h1>
                  <p className="text-white/50 font-medium">Write a message for your card. Remind yourself how amazing you are. 💕</p>
                </div>

                <Textarea 
                  placeholder="You're doing great, sweetie..."
                  className="min-h-[150px] rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 p-6 text-lg focus:border-white/30"
                  value={formData.noteToSelf}
                  onChange={(e) => setFormData({ ...formData, noteToSelf: e.target.value })}
                />

                <Button 
                  onClick={handleNext}
                  className="w-full h-14 rounded-2xl text-white text-lg font-bold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}
                >
                  <Sparkles className="w-5 h-5" /> Treat Myself
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
