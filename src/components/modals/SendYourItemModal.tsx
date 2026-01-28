'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import ConversionModal from './ConversionModal';

interface SendYourItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onLearnMore: () => void;
}

/**
 * Send Your Own Item Modal
 * Shown: After 3 scroll events on planning page
 * Purpose: Inform about custom item inclusion
 */
export default function SendYourItemModal({
  isOpen,
  onClose,
  onDismiss,
  onLearnMore,
}: SendYourItemModalProps) {
  const handleLearnMore = () => {
    onLearnMore();
    onClose();
  };

  return (
    <ConversionModal isOpen={isOpen} onClose={onClose} onDismiss={onDismiss}>
      <div className="text-center space-y-5 pt-2">
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center gap-2 py-4">
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              rotate: [-5, 0, -5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
              <span className="text-2xl">🛍️</span>
            </div>
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plus className="w-6 h-6 text-rose-500" />
          </motion.div>
          
          <motion.div
            animate={{ 
              x: [0, -10, 0],
              rotate: [5, 0, 5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <span className="text-lg font-black text-gray-400">=</span>
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center border-2 border-green-200">
              <span className="text-3xl">📦</span>
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            Got Something Extra Special? 🎁
          </h2>
          <p className="text-gray-500 mt-2 font-medium leading-relaxed">
            Already have a perfume, jewelry, or any special item you want to include? 
            Send it to us — we'll package it with your order and deliver everything together as one beautiful surprise!
          </p>
        </div>

        {/* Benefits */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-rose-500" />
            One Package
          </span>
          <span className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-purple-500" />
            One Surprise
          </span>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleLearnMore}
            className="w-full h-14 text-lg rounded-2xl bg-gray-900 hover:bg-gray-800 font-black"
          >
            See How It Works <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-gray-400 font-bold"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </ConversionModal>
  );
}
