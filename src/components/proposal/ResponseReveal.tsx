'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Play, Volume2, VolumeX, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface ResponseRevealProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'ACCEPTED' | 'REJECTED';
  partnerName: string;
  proposerName: string;
  rejectionReason?: string;
  reactionVideoUrl?: string;
  onShareClick: () => void;
}

export default function ResponseReveal({
  isOpen,
  onClose,
  status,
  partnerName,
  proposerName,
  rejectionReason,
  reactionVideoUrl,
  onShareClick
}: ResponseRevealProps) {
  const [stage, setStage] = useState<'BUILDING' | 'REVEALED'>('BUILDING');
  const [showVideo, setShowVideo] = useState(false);
  const [muted, setMuted] = useState(true);
  
  const isAccepted = status === 'ACCEPTED';

  // Reset stage when opened
  useEffect(() => {
    if (isOpen) {
      setStage('BUILDING');
      setShowVideo(false);
      
      // Animate through stages
      const timer = setTimeout(() => {
        setStage('REVEALED');
        if (isAccepted) {
          // Trigger confetti for YES
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FF0080', '#3514F5', '#FFD700', '#FF69B4']
          });
        }
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAccepted]);

  // Heartbreak particles for rejection
  const heartbreakParticles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Background */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: isAccepted 
              ? 'linear-gradient(135deg, #0a0a12 0%, #1a0a20 50%, #0a0a12 100%)'
              : 'linear-gradient(135deg, #0a0a12 0%, #1a1a1a 50%, #0a0a12 100%)'
          }}
        />

        {/* Ambient orbs */}
        <div 
          className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[150px] pointer-events-none"
          style={{ 
            background: isAccepted ? '#FF0080' : '#475569',
            opacity: 0.3 
          }} 
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none"
          style={{ 
            background: isAccepted ? '#3514F5' : '#334155',
            opacity: 0.25 
          }} 
        />

        {/* Heartbreak falling particles */}
        {!isAccepted && (
          <>
            {heartbreakParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: `${p.x}%`, top: '-10%' }}
                animate={{ 
                  y: ['0vh', '120vh'],
                  rotate: [0, 360],
                  opacity: [0.8, 0]
                }}
                transition={{ 
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                💔
              </motion.div>
            ))}
          </>
        )}

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Content */}
        <div 
          className="relative z-10 w-full max-w-md mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {stage === 'BUILDING' && (
              <motion.div
                key="building"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                className="space-y-6"
              >
                {/* Pulsing icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ 
                    background: isAccepted 
                      ? 'linear-gradient(135deg, #3514F5, #FF0080)' 
                      : 'linear-gradient(135deg, #475569, #334155)'
                  }}
                >
                  <span className="text-5xl">{isAccepted ? '💌' : '📩'}</span>
                </motion.div>

                <div className="space-y-2">
                  <motion.p 
                    className="text-white/60 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isAccepted ? 'Something beautiful awaits...' : 'Preparing the response...'}
                  </motion.p>
                  <h2 className="text-2xl font-bold text-white">
                    {partnerName}'s Response
                  </h2>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: isAccepted ? '#FF0080' : '#64748b' }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        delay: i * 0.15 
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {stage === 'REVEALED' && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Main icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ 
                    background: isAccepted 
                      ? 'linear-gradient(135deg, #FF0080, #FF69B4)' 
                      : 'linear-gradient(135deg, #475569, #1e293b)'
                  }}
                >
                  <motion.span 
                    className="text-6xl"
                    animate={isAccepted ? { scale: [1, 1.2, 1] } : { y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isAccepted ? '💕' : '💔'}
                  </motion.span>
                </motion.div>

                {/* Response text */}
                <div className="space-y-2">
                  <motion.h2 
                    className={cn(
                      "text-3xl font-black",
                      isAccepted ? "text-white" : "text-slate-300"
                    )}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {isAccepted ? 'They said YES!' : 'They said no...'}
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/60"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {isAccepted 
                      ? `${partnerName} accepted your proposal! 🎉` 
                      : `${partnerName}'s response:`}
                  </motion.p>

                  {/* Rejection reason */}
                  {!isAccepted && rejectionReason && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="mt-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700"
                    >
                      <p className="text-lg text-slate-300 italic">"{rejectionReason}"</p>
                    </motion.div>
                  )}
                </div>

                {/* Reaction video section */}
                {isAccepted && reactionVideoUrl && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                  >
                    {!showVideo ? (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold">Watch Reaction Video</p>
                            <p className="text-rose-300 text-sm">{partnerName} recorded a message! 🎬</p>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-2xl overflow-hidden bg-black border-4 border-rose-500/30">
                        <div className="relative aspect-[9/16] max-h-[50vh]">
                          <video
                            src={reactionVideoUrl}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setMuted(!muted)}
                            className="absolute bottom-4 right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            {muted ? (
                              <VolumeX className="w-5 h-5 text-white" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Share button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="pt-4"
                >
                  <Button
                    onClick={onShareClick}
                    className={cn(
                      "w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-3",
                      isAccepted 
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                    )}
                  >
                    <Share2 className="w-5 h-5" />
                    {isAccepted ? 'Share Your Love Story 💕' : 'Share Your Story 💔'}
                  </Button>
                </motion.div>

                {/* Back to home */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-white/40 text-sm"
                >
                  {isAccepted 
                    ? '10,000+ couples started their love story here 💝' 
                    : 'At least you tried... that takes courage 🙏'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
