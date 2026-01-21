'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function SurpriseFlow() {
  console.log('SurpriseFlow mounting...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    price: 0,
    hates: '',
    customMessage: ''
  });

  const prices = [
    { label: '₦50,000', value: 50000, description: 'The Self-Care Bloom' },
    { label: '₦100,000', value: 100000, description: 'The Empress/Emperor Pack' },
    { label: '₦200,000', value: 200000, description: 'The Ultimate Love Within' },
  ];

  const handlePriceSelect = (price: number) => {
    setFormData({ ...formData, price });
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2) {
      if (!formData.hates.trim()) return;
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    addItem({
      productId: 'surprise-box',
      productName: `Self-Love Curiosity Box (${prices.find(p => p.value === formData.price)?.label})`,
      basePrice: formData.price,
      quantity: 1,
      variantSelection: {},
      customizationData: {
        hates: formData.hates,
        customMessage: formData.customMessage,
        isSurprise: true,
        type: 'Self-Love'
      },
    });

    const citySlug = searchParams.get('city');
    if (citySlug) {
      router.push(`/planning/${citySlug}`);
    } else {
      router.push('/planning');
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 flex items-center justify-center p-4 md:p-8">
      <Card className="max-w-xl w-full p-8 md:p-12 rounded-[2rem] shadow-2xl border-0 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
            <motion.div 
                className="h-full bg-rose-600"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
            />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                  <Heart className="w-8 h-8 fill-rose-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">Love Starts <br/><span className="text-rose-600">With You.</span></h1>
                <p className="text-gray-500 font-medium">You deserve the mystery. You deserve the magic. Choose your self-love budget.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {prices.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePriceSelect(p.value)}
                    className="p-6 rounded-2xl border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-left flex justify-between items-center group"
                  >
                    <div>
                        <div className="text-sm font-black text-rose-600 uppercase tracking-widest">{p.description}</div>
                        <div className="text-2xl font-black text-gray-900">{p.label}</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900">Your <span className="text-rose-600">No-Go</span> List</h1>
                <p className="text-gray-500 font-medium">What should we avoid? Let us know your dislikes or allergies so we only pack what you'll love.</p>
              </div>

              <div className="space-y-4">
                <Textarea 
                  placeholder="e.g. I hate chocolates, allergic to nuts, no strong perfumes..."
                  className="min-h-[150px] rounded-2xl border-2 border-gray-100 focus:border-rose-400 p-6 text-lg"
                  value={formData.hates}
                  onChange={(e) => setFormData({ ...formData, hates: e.target.value })}
                />
                {!formData.hates.trim() && (
                   <div className="flex items-center gap-2 text-xs text-rose-500 font-bold">
                      <AlertCircle className="w-4 h-4" /> This helps us curate your perfect treat!
                   </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={handleBack} className="h-16 px-8 rounded-2xl font-black text-gray-400">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    disabled={!formData.hates.trim()}
                    className="flex-1 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-lg font-black shadow-xl"
                >
                    Next Step <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900">A Note to Self</h1>
                <p className="text-gray-500 font-medium">Write a message for your card. Something to remind you how amazing you are.</p>
              </div>

              <div className="space-y-4">
                <Textarea 
                  placeholder="You're doing great, sweetie..."
                  className="min-h-[150px] rounded-2xl border-2 border-gray-100 focus:border-rose-400 p-6 text-lg"
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={handleBack} className="h-16 px-8 rounded-2xl font-black text-gray-400">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    className="flex-1 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-lg font-black shadow-xl flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-6 h-6" /> Treat Myself
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
