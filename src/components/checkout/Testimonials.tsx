"use client";

import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
  {
    name: "Cynthia A.",
    role: "Lagos, NG",
    text: "I was so nervous about the planning, but everything went perfectly. The proposal guide alone was a lifesaver!",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Abuja, NG",
    text: "Honestly worth every penny. My fiancée was completely surprised and the photos are amazing.",
    rating: 5,
  },
  {
    name: "Tunde & Sarah",
    role: "Lekki",
    text: "Fast, professional, and discreet. The team handled everything while I just focused on the ring.",
    rating: 5,
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const review = REVIEWS[index];

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-6 relative overflow-hidden">
        {/* Decorative quote mark */}
      <span className="absolute top-2 left-3 text-6xl text-slate-200 font-serif leading-none select-none">"</span>
      
      <div className="relative z-10">
        <div className="flex gap-1 mb-3 text-amber-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
            ))}
        </div>
        
        <div className="h-20 md:h-24 relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                        "{review.text}"
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {review.name.charAt(0)}
                        </div>
                        <div className="text-xs font-medium text-slate-800">
                            {review.name} <span className="text-slate-400 font-normal">• {review.role}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
