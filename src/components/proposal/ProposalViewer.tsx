'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IProposal } from '@/models/Proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Video, XCircle, Send, Sparkles, Mail, Loader2 } from 'lucide-react';
import { getPresignedUploadUrl, respondToProposal } from '@/actions/proposal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useVideoCompressor, CompressionStatus } from '@/hooks/useVideoCompressor';

const INTRO_TEXTS = [
    "Someone thinks about you a lot...",
    "A special message from the stars...",
    "Close your eyes, make a wish...",
    "Love is just a click away...",
    "You are someone's favorite person...",
    "A little bird told me...",
    "Prepare for butterflies..."
];

// Moved outside to prevent re-mounting on every progress update
const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    className={cn("w-full max-w-md mx-auto p-2 relative z-10", className)}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

export default function ProposalViewer({ proposal }: { proposal: IProposal }) {
  const { compressVideo, status: compressionStatus, progress, setUploading, setDone, reset } = useVideoCompressor();
  
  const [stage, setStage] = useState<'ENVELOPE' | 'OPENING' | 'REVEALED' | 'ACCEPTED' | 'REJECTED' | 'SUBMITTED'>(
      proposal.status === 'PENDING' ? 'ENVELOPE' : 'SUBMITTED'
  );
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [introText, setIntroText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Randomize experience on mount
  useEffect(() => {
    setIntroText(INTRO_TEXTS[Math.floor(Math.random() * INTRO_TEXTS.length)]);
  }, []);

  // Stabilize background particles so they don't jump on every render
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      scale: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 10 + 10,
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5
    }));
  }, []);

  const rejectionOptions = [
    "I'm focusing on my career 💼",
    "I'm allergic to love 🤧",
    "My cat said no 🐱",
    "Ask me again in 5 business days 📅",
    "I'm actually an alien 👽"
  ];

  const handleOpenEnvelope = () => {
    setStage('OPENING');
    setTimeout(() => {
        setStage('REVEALED');
    }, 2500);
  };

  const handleAccept = () => {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#ff69b4', '#ffffff']
    });
    setStage('ACCEPTED');
  };

  const handleReject = () => {
    setStage('REJECTED');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files?.[0]) return;
     let file = e.target.files[0];
     
     if (file.size > 100 * 1024 * 1024) {
         alert("File is too large. Please choose a shorter video.");
         return;
     }

     try {
        // Step 1: Compress
        const compressedBlob = await compressVideo(file);
        
        if (compressedBlob) {
            file = new File([compressedBlob], "reaction.mp4", { type: 'video/mp4' });
        }

        // Step 2: Upload
        setUploading();
        const { uploadUrl, publicUrl } = await getPresignedUploadUrl();
        
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 
                'Content-Type': file.type
            }
        });

        // Step 3: Save response
        await respondToProposal(proposal._id as unknown as string, 'ACCEPTED', { videoUrl: publicUrl });
        setDone();
        setStage('SUBMITTED');
     } catch (err) {
        console.error(err);
        alert("Failed to upload video. Please try again.");
        reset();
     }
  };

  const submitRejection = async () => {
      if (!rejectionReason) return;
      setUploading();
      await respondToProposal(proposal._id as unknown as string, 'REJECTED', { reason: rejectionReason });
      setDone();
      setStage('SUBMITTED');
  };

  // Memoized button text to reduce re-renders
  const buttonContent = useMemo(() => {
    const statusMap: Record<CompressionStatus, React.ReactNode> = {
      'IDLE': <><Video className="w-5 h-5" /> Record Reaction (10s)</>,
      'LOADING_CORE': <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Studio...</>,
      'COMPRESSING': <><Loader2 className="w-4 h-4 animate-spin" /> Compressing {progress}%</>,
      'UPLOADING': <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>,
      'DONE': <><Heart className="w-5 h-5" /> Done!</>,
      'ERROR': <><XCircle className="w-5 h-5" /> Try Again</>,
    };
    return statusMap[compressionStatus] || statusMap['IDLE'];
  }, [compressionStatus, progress]);

  const isProcessing = ['LOADING_CORE', 'COMPRESSING', 'UPLOADING'].includes(compressionStatus);

  // --- Render Logic ---

  if (stage === 'SUBMITTED' || proposal.status !== 'PENDING') {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh] animate-in fade-in duration-1000">
             <div className="relative">
                 <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                 <div className="w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-2xl relative z-10 border border-white/40">
                    {proposal.status === 'ACCEPTED' || stage === 'ACCEPTED' || stage === 'SUBMITTED' ? (
                        <Heart className="w-12 h-12 text-red-500 fill-red-500 animate-pulse" />
                    ) : (
                        <XCircle className="w-12 h-12 text-gray-400" />
                    )}
                 </div>
             </div>
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">Response Sent</h2>
              <p className="text-white/90 text-lg font-light">Your story continues...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-gradient-to-br from-red-600 via-pink-600 to-purple-800">
        
        {/* Ambient Particles */}
        {particles.map((p) => (
            <motion.div
                key={p.id}
                className="absolute bg-white rounded-full opacity-20"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    scale: p.scale,
                    width: p.width,
                    height: p.height,
                }}
                animate={{ 
                    y: [null, -100],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                    duration: p.duration, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
            />
        ))}

        <AnimatePresence mode="wait">
            
            {/* STAGE 1: ENVELOPE */}
            {stage === 'ENVELOPE' && (
                <Container key="envelope" className="cursor-pointer" >
                    <div onClick={handleOpenEnvelope}>
                        <motion.div 
                            className="bg-white rounded-lg shadow-2xl p-8 md:p-12 text-center transform hover:scale-105 transition-transform duration-300 relative overflow-hidden"
                            whileHover={{ rotate: [-1, 1, -1] }}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-pink-500 to-red-400" />
                            <Mail className="w-24 h-24 mx-auto text-pink-400 mb-6" />
                            <h2 className="text-3xl font-serif text-gray-800 mb-2">For You</h2>
                            <p className="text-gray-500 uppercase tracking-widest text-xs">Tap to Open</p>
                            
                            <motion.div 
                                className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-50"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            />
                        </motion.div>
                    </div>
                </Container>
            )}

            {/* STAGE 2: OPENING SEQUENCE */}
            {stage === 'OPENING' && (
                <Container key="opening">
                    <div className="text-center text-white">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                           <Heart className="w-24 h-24 text-white fill-white mx-auto mb-8 animate-pulse" />
                        </motion.div>
                        <motion.h3 
                            className="text-2xl md:text-3xl font-light italic"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            "{introText}"
                        </motion.h3>
                    </div>
                </Container>
            )}

            {/* STAGE 3: THE REVEAL */}
            {stage === 'REVEALED' && (
                <Container key="revealed">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl overflow-hidden">
                        <div className="relative h-48 bg-gradient-to-b from-pink-100 to-white flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="text-center relative z-10">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="inline-block p-3 rounded-full bg-white shadow-lg mb-4"
                                >
                                    <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-800">Hi {proposal.partnerName},</h2>
                                <p className="text-gray-500 text-sm mt-1">{proposal.proposerName} has a question...</p>
                            </div>
                        </div>
                        
                        <CardContent className="p-8 pt-2 text-center">
                             <div className="mb-10 relative">
                                <span className="absolute -top-6 left-0 text-6xl text-pink-200 font-serif">"</span>
                                <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed font-serif px-6">
                                    {proposal.message}
                                </p>
                                <span className="absolute -bottom-10 right-0 text-6xl text-pink-200 font-serif">"</span>
                             </div>

                             <div className="space-y-4 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-xl shadow-red-200 hover:shadow-red-300 transition-all"
                                    onClick={handleAccept}
                                >
                                    YES, I Will! 💖
                                </motion.button>
                                
                                <Button 
                                    variant="ghost" 
                                    className="text-gray-400 hover:text-gray-600 hover:bg-transparent text-sm"
                                    onClick={handleReject}
                                >
                                    No, maybe later
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                </Container>
            )}

            {/* STAGE 4: ACCEPTED (VIDEO UPLOAD) */}
            {stage === 'ACCEPTED' && (
                <Container key="accepted">
                    <Card className="bg-white/90 backdrop-blur-xl border-none shadow-2xl">
                        <CardContent className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Heart className="w-10 h-10 fill-green-600" />
                            </motion.div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Yaaay! You said YES! 🎉</h2>
                            <p className="text-gray-600 mb-4">
                                {proposal.proposerName} is going to be so happy. 
                            </p>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-6 text-sm text-orange-800">
                                📸 <strong>Tip:</strong> Keep your reaction video under <strong>10 seconds</strong>! 
                                <br/>(Short & sweet works best 😉)
                            </div>
                            
                            <input 
                                type="file" 
                                accept="video/*" 
                                capture="user"
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            
                            <Button 
                                size="lg" 
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl mb-3 gap-2"
                                disabled={isProcessing}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {buttonContent}
                            </Button>

                            <button 
                                onClick={() => setStage('SUBMITTED')} 
                                className="text-sm text-gray-400 hover:underline"
                                disabled={isProcessing}
                            >
                                Skip video upload
                            </button>
                        </CardContent>
                    </Card>
                </Container>
            )}

            {/* STAGE 5: REJECTED */}
             {stage === 'REJECTED' && (
                 <Container key="rejected">
                    <Card className="bg-white/95 backdrop-blur-xl border-none shadow-2xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Awww... wait, why? 🥺</h3>
                            <div className="space-y-2 mb-6">
                                {rejectionOptions.map((opt) => (
                                    <motion.div 
                                        key={opt}
                                        className={cn(
                                            "p-4 rounded-xl border text-left cursor-pointer transition-all",
                                            rejectionReason === opt 
                                                ? "border-red-500 bg-red-50 text-red-900" 
                                                : "border-gray-100 hover:bg-gray-50 text-gray-600"
                                        )}
                                        onClick={() => setRejectionReason(opt)}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {opt}
                                    </motion.div>
                                ))}
                            </div>
                            <Button 
                                className="w-full h-12 rounded-xl"
                                disabled={!rejectionReason || isProcessing}
                                onClick={submitRejection}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                                ) : (
                                    <>Send Response <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                 </Container>
            )}

        </AnimatePresence>
    </div>
  );
}
