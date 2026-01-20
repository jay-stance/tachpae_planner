'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  {
    id: 'mood',
    question: "What's the vibe of this gift?",
    options: [
      { label: "Romantic & Deep", icon: "❤️" },
      { label: "Fun & Playful", icon: "🎈" },
      { label: "Sophisticated & Elegant", icon: "✨" },
      { label: "Adventurous", icon: "🚲" }
    ]
  },
  {
    id: 'budget',
    question: "What's your preferred budget range?",
    options: [
      { label: "₦20k - ₦50k", icon: "🥉" },
      { label: "₦50k - ₦150k", icon: "🥈" },
      { label: "₦150k - ₦500k", icon: "🥇" },
      { label: "Unlimited Love", icon: "💎" }
    ]
  },
  {
    id: 'interest',
    question: "What do they love most?",
    options: [
      { label: "Self Care & Spa", icon: "🛁" },
      { label: "Tech & Gadgets", icon: "📱" },
      { label: "Food & Fine Dining", icon: "🍷" },
      { label: "Art & Creativity", icon: "🎨" }
    ]
  }
];

export default function SurprisePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: option };
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-white/50" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Planner
        </Button>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-rose-100 p-3 rounded-full">
                      <Sparkles className="w-8 h-8 text-rose-500" />
                    </div>
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {QUESTIONS.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-rose-500' : 'w-2 bg-rose-200'}`} 
                      />
                    ))}
                  </div>
                  <CardTitle className="text-2xl font-bold">{QUESTIONS[currentStep].question}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                  {QUESTIONS[currentStep].options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(opt.label)}
                      className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-rose-50 hover:border-rose-300 hover:bg-rose-50 transition-all text-center"
                    >
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{opt.icon}</span>
                      <span className="font-semibold text-gray-800">{opt.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="border-0 shadow-2xl bg-white p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-green-600 fill-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
                <p className="text-muted-foreground mb-8">
                  Our curators will now hand-pick the perfect gift based on your preferences.
                  You'll see this surprise in your final itinerary!
                </p>
                <div className="space-y-3">
                   <Button 
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-lg rounded-xl"
                    onClick={() => router.back()}
                  >
                    Go Back to Planner <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={reset}
                  >
                    Redo Questionnaire
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
