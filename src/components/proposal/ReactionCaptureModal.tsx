'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReactionCaptureModalProps {
  isOpen: boolean;
  proposerName: string;
  stream: MediaStream | null;
  isRequesting: boolean;
  onAllow: () => void;
  onDecline: () => void;
}

/**
 * Modal that asks for camera permission to capture real-time reactions
 * Copy is designed for Nigerian audience - warm, playful, and compelling
 */
export default function ReactionCaptureModal({
  isOpen,
  proposerName,
  stream,
  isRequesting,
  onAllow,
  onDecline,
}: ReactionCaptureModalProps) {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Show live preview when stream is available
  useEffect(() => {
    if (stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/10"
          style={{ background: 'rgba(30, 30, 40, 0.95)', backdropFilter: 'blur(20px)' }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Gradient header bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, var(--tachpae-primary), var(--tachpae-secondary), var(--tachpae-accent))' }}
          />

          <div className="p-6 md:p-8 text-center">
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Camera className="w-10 h-10 text-white" />
            </motion.div>

{/* Title */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Do this for {proposerName}! 💕
            </h2>

            {/* Copy */}
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
              We want to capture your live reaction as you read their message. 
              {' '}
              <span className="text-white font-medium">
                Imagine {proposerName}&apos;s excitement when they see you blushing! 😍
              </span>
            </p>
            {/* Live preview when stream available */}
            {stream && (
              <motion.div
                className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden mb-6 border-2 border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute inset-0 rounded-2xl ring-2 ring-green-500 ring-inset animate-pulse" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white bg-green-500/80 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </div>
              </motion.div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 mb-6 text-xs text-white/50">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Only {proposerName} go see this video</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-14 text-lg font-bold text-white rounded-2xl shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))',
                  boxShadow: '0 8px 30px rgba(53, 20, 245, 0.4)',
                }}
                onClick={onAllow}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Setting up camera...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Yes, capture my reaction! 🎬
                  </span>
                )}
              </Button>

              <button
                className="text-sm text-white/40 hover:text-white/70 transition-colors py-2"
                onClick={onDecline}
                disabled={isRequesting}
              >
                <CameraOff className="w-4 h-4 inline mr-1 opacity-50" />
                I go just read am first
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
