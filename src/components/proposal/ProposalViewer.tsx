'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IProposal } from '@/models/Proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Video, XCircle, Send, Sparkles, Mail, Loader2, Stars, Share2, Download, X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { getPresignedUploadUrl, respondToProposal } from '@/actions/proposal';
import { sendEvent } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useVideoCompressor, CompressionStatus } from '@/hooks/useVideoCompressor';
import UpsellProducts from './UpsellProducts';
import ShareCard from './ShareCard';
import ReactionCaptureModal from './ReactionCaptureModal';
import { useReactionRecorder } from '@/hooks/useReactionRecorder';

const INTRO_TEXTS = [
    "Somebody's head is swelling because of you... 🙈❤️",
    "Your own 'God When' moment is finally here... 🥺✨",
    "Forget breakfast, someone wants to serve you love... 🥞🥰",
    "Oya hold your chest, something sweet is coming... 💓🍬",
    "See the person that cannot sleep because of you... 👀🌙",
    "Someone wants to stress you with enjoyment... 😌🦋",
    "You are the main character in someone's story... 🎬🌟"
];

// Moved outside to prevent re-mounting on every progress update
const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    className={cn("w-full max-w-lg mx-auto px-3 md:px-4 relative z-10", className)}
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
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
  const [showShareCard, setShowShareCard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Music and Reaction Capture state
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [isCapturingReaction, setIsCapturingReaction] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  // Reaction recorder hook
  const {
    status: recorderStatus,
    stream: recorderStream,
    videoBlob,
    videoUrl: recordedVideoUrl,
    requestPermission,
    startRecording,
    stopRecording,
    reset: resetRecorder,
    lockOrientation,
    unlockOrientation,
  } = useReactionRecorder();

  // Prefetch upsell products in background on mount
  useEffect(() => {
    const fetchUpsellProducts = async () => {
      try {
        const res = await fetch('/api/products/upsell?count=2&categories=3');
        const data = await res.json();
        if (data.success) {
          setUpsellProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch upsell products:', error);
      }
    };
    fetchUpsellProducts();
  }, []);

  // Randomize experience on mount and track view
  useEffect(() => {
    setIntroText(INTRO_TEXTS[Math.floor(Math.random() * INTRO_TEXTS.length)]);
    
    // Track view event
    sendEvent({
      action: 'view_item',
      category: 'proposal',
      label: proposal._id as unknown as string,
      value: 0
    });
  }, [proposal._id]);

  // Stabilize background particles so they don't jump on every render
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      scale: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 15 + 10,
      width: Math.random() * 6 + 2,
      height: Math.random() * 6 + 2
    }));
  }, []);

  // Wire live video preview to the recorder stream
  useEffect(() => {
    if (recorderStream && liveVideoRef.current) {
      liveVideoRef.current.srcObject = recorderStream;
    }
  }, [recorderStream]);

  // Unlock audio on mount (required for mobile browsers)
  useEffect(() => {
    if (audioRef.current) {
      // Load the audio to prepare it for playback
      audioRef.current.load();
      console.log('[Audio] Preloaded for mobile playback');
    }
  }, []);

const rejectionOptions = [
    "I'm already in a serious talking stage 🌚🔒",
    "I thought we were just vibing? 🤡💀",
    "My heart is currently on Airplane Mode ✈️📵",
    "You are like a brother/sister to me 😂💔",
    "We don't match... respectfully 👀"
  ];

  const handleOpenEnvelope = () => {
    // Show capture modal first instead of immediately proceeding
    setShowCaptureModal(true);
  };

  // Play background music at reduced volume during recording
  const playMusic = async () => {
    if (audioRef.current) {
      try {
        // Set volume
        audioRef.current.volume = isCapturingReaction ? 0.35 : 0.6;
        
        // Try to play
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('[Audio] ✅ Playback started');
      } catch (e: any) {
        console.warn('[Audio] Autoplay blocked:', e.message);
        
        // On mobile, audio needs user interaction to unlock
        // The user already interacted (clicked modal button), so try once more
        setTimeout(async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
            console.log('[Audio] ✅ Retry successful');
          } catch (retryError) {
            console.error('[Audio] ❌ Retry failed - user may need to enable sound manually');
          }
        }, 100);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle user allowing camera capture
  const handleAllowCapture = async () => {
    const stream = await requestPermission();
    if (stream) {
      setIsCapturingReaction(true);
      
      // Lock to portrait in fullscreen for proper recording
      const locked = await lockOrientation();
      if (!locked) {
        console.warn('[ProposalViewer] Orientation lock failed - proceeding anyway');
      }
      
      startRecording(stream);
      setShowCaptureModal(false);
      playMusic();
      setStage('OPENING');
      setTimeout(() => {
        setStage('REVEALED');
      }, 3000);
    } else {
      // Fallback if permission failed
      handleDeclineCapture();
      alert("Camera access failed. Proceeding without recording.");
    }
  };

  // Handle user declining camera capture
  const handleDeclineCapture = () => {
    setShowCaptureModal(false);
    playMusic();
    setStage('OPENING');
    setTimeout(() => {
      setStage('REVEALED');
    }, 3000);
  };

  const handleAccept = () => {
    confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#3514F5', '#00C2FF', '#FF0080', '#ffffff']
    });
    
    // Stop recording if active
    if (isCapturingReaction) {
      stopRecording();
      unlockOrientation(); // Exit fullscreen and unlock orientation
    }
    
    setStage('ACCEPTED');

    // Track acceptance
    sendEvent({
      action: 'proposal_accepted',
      category: 'proposal',
      label: proposal._id as unknown as string,
    });
  };

  const handleReject = () => {
    // Stop recording if active
    if (isCapturingReaction) {
      stopRecording();
      unlockOrientation(); // Exit fullscreen and unlock orientation
    }
    setStage('REJECTED');
  };

  // Upload the recorded reaction video blob
  const uploadReactionVideo = async () => {
    if (!videoBlob) return;

    try {
      // Step 1: Compress (or bypass if small)
      // Detect correct extension likely from mime type
      const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      let file = new File([videoBlob], `reaction.${ext}`, { type: videoBlob.type });

      const compressedBlob = await compressVideo(file);
      if (compressedBlob) {
        file = new File([compressedBlob], 'reaction.mp4', { type: 'video/mp4' });
      }

      // Step 2: Upload
      setUploading();
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl();
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Step 3: Save response
      await respondToProposal(proposal._id as unknown as string, 'ACCEPTED', { videoUrl: publicUrl });
      setDone();
      resetRecorder();
      setIsCapturingReaction(false);
      setStage('SUBMITTED');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload video. Please try again.');
      reset();
    }
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

      // Track rejection
      sendEvent({
        action: 'proposal_rejected',
        category: 'proposal',
        label: proposal._id as unknown as string,
        item_variant: rejectionReason // Track the reason as variant
      });
  };

  // Memoized button text to reduce re-renders
  const buttonContent = useMemo(() => {
    const statusMap: Record<CompressionStatus, React.ReactNode> = {
      'IDLE': <><Video className="w-5 h-5" /> Record My Reaction</>,
      'LOADING_CORE': <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>,
      'COMPRESSING': <><Loader2 className="w-4 h-4 animate-spin" /> Processing {progress}%</>,
      'UPLOADING': <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>,
      'DONE': <><Heart className="w-5 h-5" /> Sent!</>,
      'ERROR': <><XCircle className="w-5 h-5" /> Try Again</>,
    };
    return statusMap[compressionStatus] || statusMap['IDLE'];
  }, [compressionStatus, progress]);

  const isProcessing = ['LOADING_CORE', 'COMPRESSING', 'UPLOADING'].includes(compressionStatus);

  // --- Render Logic ---

  if (stage === 'SUBMITTED' || proposal.status !== 'PENDING') {
      const isAccepted = proposal.status === 'ACCEPTED' || stage === 'ACCEPTED' || stage === 'SUBMITTED';
      
      return (
          <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 md:px-8" style={{ background: 'var(--tachpae-bg-dark)' }}>
             {/* Hero Section */}
             <div className="text-center mb-8 md:mb-12">
               <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="relative inline-block mb-6"
               >
                   <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: 'var(--tachpae-primary)', opacity: 0.3 }} />
                   <div className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-2xl relative z-10 border border-white/10" style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}>
                      {isAccepted ? (
                          <Heart className="w-10 h-10 md:w-14 md:h-14 text-white fill-white animate-pulse" />
                      ) : (
                          <XCircle className="w-10 h-10 md:w-14 md:h-14 text-white/50" />
                      )}
                   </div>
               </motion.div>
               <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                 {isAccepted ? 'Response Sent! 💖' : 'Response Sent'}
               </h2>
               <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
                 {isAccepted 
                   ? `${proposal.proposerName} will be thrilled! Your love story is just beginning...`
                   : 'Your response has been delivered.'}
               </p>
             </div>

             {/* Upsell Section */}
             {upsellProducts.length > 0 && (
               <div className="w-full max-w-lg">
                 <UpsellProducts 
                   products={upsellProducts}
                   citySlug="abuja"
                   title={isAccepted ? "Make this moment unforgettable" : "Treat yourself today"}
                   subtitle={isAccepted 
                     ? "10,000+ couples chose Tachpae to say 'I love you'. Your turn?"
                     : "You deserve something special too."
                   }
                   ctaText="Explore More Gifts"
                 />
               </div>
             )}

             {/* Share Your Answer Section */}
             {(isAccepted || proposal.status === 'REJECTED' || stage === 'REJECTED') && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.8 }}
                 className="w-full max-w-lg mt-8 relative z-20"
               >
                 <div 
                   className="rounded-2xl p-5 text-center shadow-2xl"
                   style={{ 
                     background: isAccepted 
                        ? 'linear-gradient(135deg, rgba(53, 20, 245, 0.3), rgba(255, 0, 128, 0.2))' 
                        : 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                     border: '2px solid rgba(255,255,255,0.2)',
                   }}
                 >
                   <h3 className="text-xl font-bold text-white mb-2">
                     {isAccepted ? 'Share Your Love Story 💕' : 'Share Your Decision 💔'}
                   </h3>
                   <p className="text-white text-sm mb-5 opacity-80">
                     Create a card to share with friends!
                   </p>
                   
                   <button
                     type="button"
                     onClick={() => setShowShareCard(true)}
                     className="w-full h-14 rounded-2xl text-white text-lg font-bold flex items-center justify-center gap-3 shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                     style={{ 
                       background: isAccepted
                        ? 'linear-gradient(135deg, #3514F5, #FF0080)'
                        : 'linear-gradient(135deg, #64748b, #475569)',
                     }}
                   >
                     <Share2 className="w-6 h-6" />
                     Create Share Card
                   </button>
                   
                   <p className="text-white text-[11px] mt-4 opacity-50">
                     Tag @tachpae on Instagram & TikTok!
                   </p>
                 </div>
               </motion.div>
             )}

             {/* Share Card Modal */}
             <ShareCard
               proposerName={proposal.proposerName}
               partnerName="Partner"
               message={proposal.message}
               isOpen={showShareCard}
               onClose={() => setShowShareCard(false)}
               status={proposal.status === 'REJECTED' || stage === 'REJECTED' ? 'REJECTED' : 'ACCEPTED'}
               rejectionReason={proposal.rejectionReason || rejectionReason}
             />

             {/* Social Proof */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="mt-8 text-center"
             >
               <p className="text-white/30 text-xs">
                 💝 Trusted by lovers across Nigeria
               </p>
              </motion.div>
              
              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 flex justify-center"
              >
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 rounded-full text-white font-bold bg-white/10 hover:bg-white/20 hover:scale-105 transition-all text-base flex items-center gap-2 border border-white/10 shadow-lg"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Create Your Own Proposal
                </button>
              </motion.div>
          </div>
      );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-x-hidden font-sans py-12 md:py-0" style={{ background: 'var(--tachpae-bg-dark)' }}>
        
        {/* Ambient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'var(--tachpae-primary)', opacity: 0.25 }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'var(--tachpae-secondary)', opacity: 0.2 }} />
        <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none" style={{ background: 'var(--tachpae-accent)', opacity: 0.15 }} />
        
        {/* Ambient Particles */}
        {particles.map((p) => (
            <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    scale: p.scale,
                    width: p.width,
                    height: p.height,
                    background: 'var(--tachpae-secondary)',
                    opacity: 0.4,
                }}
                animate={{ 
                    y: [null, -150],
                    opacity: [0.2, 0.5, 0.2]
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
                            className="rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 text-center relative overflow-hidden border border-white/10"
                            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
                            whileHover={{ scale: 1.02, rotate: 1 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Shimmer effect */}
                            <motion.div 
                                className="absolute inset-0 opacity-20"
                                style={{ background: 'linear-gradient(135deg, transparent 40%, var(--tachpae-secondary) 50%, transparent 60%)' }}
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            />
                            
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-8" style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}>
                                    <Mail className="w-8 h-8 md:w-12 md:h-12 text-white" />
                                </div>
                            </motion.div>
                            
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">A Message For You</h2>
                            <p className="text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-medium">Tap to Reveal</p>
                            
                            {/* Glow ring */}
                            <motion.div 
                                className="absolute inset-0 rounded-3xl pointer-events-none"
                                style={{ border: '1px solid var(--tachpae-primary)' }}
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </motion.div>
                    </div>
                </Container>
            )}

            {/* STAGE 2: OPENING SEQUENCE */}
            {stage === 'OPENING' && (
                <Container key="opening">
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="mb-6 md:mb-10"
                        >
                           <div className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}>
                               <Heart className="w-10 h-10 md:w-14 md:h-14 text-white fill-white animate-pulse" />
                           </div>
                        </motion.div>
                        <motion.h3 
                            className="text-xl md:text-3xl font-light text-white/90 italic"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            "{introText}"
                        </motion.h3>
                        <motion.div 
                            className="mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            <div className="w-12 h-1 mx-auto rounded-full animate-pulse" style={{ background: 'var(--tachpae-secondary)' }} />
                        </motion.div>
                    </div>
                </Container>
            )}

            {/* STAGE 3: THE REVEAL - COMPLETELY REDESIGNED */}
            {stage === 'REVEALED' && (
                <Container key="revealed">
                    <motion.div 
                        className="relative rounded-3xl overflow-hidden border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Top decorative gradient bar */}
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--tachpae-primary), var(--tachpae-secondary), var(--tachpae-accent))' }} />
                        
                        {/* Header Section */}
                        <div className="relative px-5 md:px-8 pt-6 md:pt-10 pb-4 md:pb-6 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                                className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-4 md:mb-6"
                                style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                            >
                                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <p className="text-white/40 text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">A Question From</p>
                                <h2 className="text-2xl md:text-4xl font-black text-white">{proposal.proposerName}</h2>
                            </motion.div>
                        </div>
                        
                        {/* Message Section */}
                        <div className="px-5 md:px-8 pb-5 md:pb-8">
                            <motion.div 
                                className="relative p-4 md:p-6 rounded-xl md:rounded-2xl text-center"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <p className="text-lg md:text-2xl font-medium text-white leading-relaxed">
                                    "{proposal.message}"
                                </p>
                            </motion.div>
                            
                            {/* Addressed to */}
                            <motion.p 
                                className="text-center text-white/50 text-xs md:text-sm mt-4 md:mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                            >
                                — For <span className="text-white font-medium">{proposal.partnerName}</span>
                            </motion.p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--tachpae-primary), transparent)' }} />

                        {/* Action Section */}
                        <div className="p-5 md:p-8 space-y-3 md:space-y-4">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(53, 20, 245, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 md:py-5 text-base md:text-xl font-bold text-white rounded-xl md:rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3"
                                style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))', boxShadow: '0 8px 30px rgba(53, 20, 245, 0.3)' }}
                                onClick={handleAccept}
                            >
                                <Heart className="w-5 h-5 md:w-6 md:h-6 fill-white" /> Yes, I'll Be Your Valentine!
                            </motion.button>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.3 }}
                            >
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-white/30 hover:text-white/60 hover:bg-white/5 text-sm py-3"
                                    onClick={handleReject}
                                >
                                    Not right now...
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </Container>
            )}

            {/* STAGE 4: ACCEPTED (VIDEO UPLOAD) */}
            {stage === 'ACCEPTED' && (
                <Container key="accepted">
                    <motion.div 
                        className="rounded-3xl overflow-hidden border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}
                            >
                                <Heart className="w-12 h-12 text-white fill-white" />
                            </motion.div>
                            
                            <button 
                                onClick={async () => {
                                    setUploading();
                                    await respondToProposal(proposal._id as unknown as string, 'ACCEPTED', {});
                                    setDone();
                                    setStage('SUBMITTED');
                                }}
                                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            
                            <h2 className="text-3xl font-black text-white mb-3">You Said YES! 🎉</h2>

                            {/* Processing State: We were recording but URL isn't ready yet */}
                            {isCapturingReaction && !recordedVideoUrl ? (
                                <div className="py-12">
                                  <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
                                  <p className="text-white/70">Finalizing your reaction video...</p>
                                </div>
                            ) : recordedVideoUrl ? (
                              <>
                                <p className="text-white/60 mb-4 text-sm">
                                  We caught your reaction! Preview and send it to {proposal.proposerName} 💕
                                </p>
                                
                                {/* Video Preview */}
                                <div className="relative w-52 aspect-[9/16] mx-auto rounded-2xl overflow-hidden border-2 border-white/20 mb-6 bg-black">
                                  <video
                                    src={recordedVideoUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                    playsInline
                                  />
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full h-14 text-white rounded-2xl mb-3 gap-2 font-bold text-lg"
                                    style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                                    disabled={isProcessing}
                                    onClick={uploadReactionVideo}
                                >
                                    {isProcessing ? (
                                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                                    ) : (
                                      <>Send My Reaction 💕</>
                                    )}
                                </Button>

                                <button 
                                    onClick={() => {
                                      resetRecorder();
                                      setIsCapturingReaction(false);
                                    }}
                                    className="text-sm text-white/30 hover:text-white/50 transition-colors"
                                    disabled={isProcessing}
                                >
                                    Re-record instead
                                </button>
                              </>
                            ) : (
                              <>
                            
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
                                className="w-full h-14 text-white rounded-2xl mb-4 gap-2 font-bold text-lg"
                                style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                                disabled={isProcessing}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {buttonContent}
                            </Button>

                            <button 
                                onClick={async () => { 
                                    setUploading();
                                    await respondToProposal(proposal._id as unknown as string, 'ACCEPTED', {});
                                    setDone();
                                    setStage('SUBMITTED'); 
                                }} 
                                className="text-sm text-white/30 hover:text-white/50 transition-colors"
                                disabled={isProcessing}
                            >
                                Skip and send response
                                </button>
                              </>
                            )}
                        </div>
                    </motion.div>
                </Container>
            )}

            {/* STAGE 5: REJECTED */}
             {stage === 'REJECTED' && (
                 <Container key="rejected">
                    <motion.div 
                        className="rounded-3xl overflow-hidden border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}
                    >
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Let them down easy... 💔</h3>
                            <div className="space-y-3 mb-6">
                                {rejectionOptions.map((opt) => (
                                    <motion.div 
                                        key={opt}
                                        className={cn(
                                            "p-4 rounded-xl border text-left cursor-pointer transition-all",
                                            rejectionReason === opt 
                                                ? "border-white/30 text-white" 
                                                : "border-white/10 hover:border-white/20 text-white/60"
                                        )}
                                        style={rejectionReason === opt ? { background: 'rgba(255,255,255,0.1)' } : { background: 'rgba(255,255,255,0.02)' }}
                                        onClick={() => setRejectionReason(opt)}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {opt}
                                    </motion.div>
                                ))}
                            </div>
                            <Button 
                                className="w-full h-12 rounded-xl text-white font-bold"
                                style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                                disabled={!rejectionReason || isProcessing}
                                onClick={submitRejection}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                                ) : (
                                    <>Send Response <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                 </Container>
             )}

        </AnimatePresence>

        {/* Background Music Audio */}
        <audio
          ref={audioRef}
          src="/sounds/romantic-bg.mp3"
          loop
          preload="auto"
        />

        {/* Reaction Capture Modal */}
        <ReactionCaptureModal
          isOpen={showCaptureModal}
          proposerName={proposal.proposerName}
          stream={recorderStream}
          isRequesting={recorderStatus === 'REQUESTING'}
          onAllow={handleAllowCapture}
          onDecline={handleDeclineCapture}
        />

        {/* Music Attribution (Subtle) */}
        {!isMuted && (
          <div className="fixed bottom-1 right-2 z-30 opacity-30 hover:opacity-100 transition-opacity text-[10px] text-white pointer-events-none">
             Music by <a href="https://pixabay.com/users/paulyudin-27739282/" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">Pavel Bekirov</a> from <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">Pixabay</a>
          </div>
        )}

        {/* Live Recording Indicator + Mute/Play Controls */}
        {stage !== 'ENVELOPE' && (
          <div className="fixed bottom-4 left-4 right-4 flex items-center justify-between z-40 px-2">
            <div className="flex items-center gap-2">
              {/* Play/Pause Toggle */}
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Live Recording Badge */}
            {isCapturingReaction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/80 text-white text-xs font-bold"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Recording
              </motion.div>
            )}
          </div>
        )}

        {/* Live Camera Preview (bottom right) */}
        {isCapturingReaction && recorderStream && (stage === 'OPENING' || stage === 'REVEALED' || stage === 'ACCEPTED') && (
          <motion.div
            className="fixed bottom-20 right-4 w-24 h-32 md:w-28 md:h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-50"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <video
              ref={liveVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-rose-500/50 ring-inset" />
          </motion.div>
        )}
    </div>
  );
}
