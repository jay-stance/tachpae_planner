'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss?: () => void; // Called when user explicitly dismisses
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

/**
 * Base modal component for all conversion modals
 * - Bottom sheet style for mobile
 * - Smooth slide-up animation
 * - Backdrop with blur
 */
export default function ConversionModal({
  isOpen,
  onClose,
  onDismiss,
  children,
  className,
  showCloseButton = true,
}: ConversionModalProps) {
  const handleDismiss = () => {
    onDismiss?.();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Content - Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className={cn(
              "relative w-full max-w-lg bg-white rounded-t-[2rem] shadow-2xl pb-safe",
              "max-h-[85vh] overflow-y-auto",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="sticky top-0 pt-3 pb-2 bg-white rounded-t-[2rem] z-10">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            </div>

            {/* Close Button */}
            {showCloseButton && (
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {/* Content */}
            <div className="px-6 pb-8">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
