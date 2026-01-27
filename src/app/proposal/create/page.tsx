'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Copy, ArrowRight, ArrowLeft, Check, History, ExternalLink, Mail, User, XCircle, Sparkles, Video, Gift } from 'lucide-react';
import { createProposal, getProposalsByDeviceId } from '@/actions/proposal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import ResponseReveal from '@/components/proposal/ResponseReveal';
import ShareCard from '@/components/proposal/ShareCard';

export default function CreateProposal() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [previousProposals, setPreviousProposals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    proposerName: '',
    proposerEmail: '',
    partnerName: '',
    message: '',
    theme: 'classic-red'
  });
  
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
  
  // Response Reveal Experience
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tachpae_revealed_proposals');
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });
  const [activeReveal, setActiveReveal] = useState<any | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  // Helper to detect video URLs
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);
  const getFirstImage = (mediaGallery: string[] = []) => mediaGallery.find(url => !isVideoUrl(url)) || null;

  // Persist revealed IDs to localStorage
  useEffect(() => {
    if (revealedIds.size > 0) {
      localStorage.setItem('tachpae_revealed_proposals', JSON.stringify([...revealedIds]));
    }
  }, [revealedIds]);

  // Initialize Device ID and Fetch History
  useEffect(() => {
    setIsMounted(true);
    let id = localStorage.getItem('tachpae_device_id');
    if (!id) {
      // Fallback for non-secure contexts
      id = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('tachpae_device_id', id);
    }
    setDeviceId(id);
    fetchHistory(id);
  }, []);

  const fetchHistory = async (id: string) => {
    if (!id) return;
    try {
      console.log('Fetching history for:', id);
      const history = await getProposalsByDeviceId(id);
      console.log('History received:', history.length);
      setPreviousProposals(history);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // Prefetch upsell products in background
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

  if (!isMounted) return null; // Prevent hydration mismatch

  const handleSubmit = async () => {
    if (!formData.proposerName || !formData.partnerName || !formData.message || !formData.proposerEmail) return;
    
    setLoading(true);
    try {
        const result = await createProposal({ ...formData, deviceId });
        const link = `${window.location.origin}/proposal/${result.id}`;
        setGeneratedLink(link);
        setStep(2);
        fetchHistory(deviceId); // Refresh history
    } catch (error) {
        console.error(error);
        alert("Failed to create proposal. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(generatedLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(generatedLink);
        });
    } else {
        fallbackCopy(generatedLink);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.zIndex = "-1";
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if(successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden" style={{ background: 'var(--tachpae-bg-dark)' }}>
        {/* Background orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'var(--tachpae-primary)', opacity: 0.2 }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" style={{ background: 'var(--tachpae-secondary)', opacity: 0.15 }} />

        {/* Home Button */}
        <div className="absolute top-4 left-4 z-50">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 gap-2 pl-2 pr-4 transition-all">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-bold">Home</span>
            </Button>
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-12 md:mt-0">
             
             {/* Left: Main Action Card */}
             <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
             >
                <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl sticky top-8">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}>
                            {step === 1 ? 'Create Your Proposal' : 'Your Link is Ready!'}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 
                                ? "Fill in the details below to generate a unique, romantic page for your Valentine." 
                                : "Share this link with your special someone and wait for their reaction!"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-6">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Your Name</label>
                                        <div className="relative">
                                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                          <Input 
                                              placeholder="Romeo" 
                                              className="pl-10 h-11 rounded-xl"
                                              value={formData.proposerName}
                                              onChange={(e) => setFormData({...formData, proposerName: e.target.value})}
                                          />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Partner's Name</label>
                                        <div className="relative">
                                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                          <Input 
                                              placeholder="Juliet" 
                                              className="pl-10 h-11 rounded-xl"
                                              value={formData.partnerName}
                                              onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                                          />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Your Email</label>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                      <Input 
                                          placeholder="romeo@love.com" 
                                          className="pl-10 h-11 rounded-xl"
                                          value={formData.proposerEmail}
                                          onChange={(e) => setFormData({...formData, proposerEmail: e.target.value})}
                                      />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Your Romantic Message</label>
                                    <textarea 
                                        className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-opacity-10  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                                        placeholder="Will you be my Valentine? I promise to..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>

                                <Button 
                                    className="w-full h-12 text-lg mt-4 text-white shadow-xl rounded-xl"
                                    style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))', boxShadow: '0 8px 24px rgba(53, 20, 245, 0.3)' }}
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.message || !formData.partnerName || !formData.proposerEmail}
                                >
                                    {loading ? 'Creating Magic...' : 'Generate Proposal Link'} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3 break-all">
                                    <span className="text-sm text-rose-900 grow font-mono selection:bg-rose-200">{generatedLink}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="h-12 border-2 rounded-xl"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </Button>
                                    <Button 
                                        className="h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi ${formData.partnerName}, I have a surprise for you: ${generatedLink}`)}`, '_blank')}
                                    >
                                        Share on WhatsApp
                                    </Button>
                                </div>

                                {/* Upsell Section - After Link Generation */}
                                {upsellProducts.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-6 pt-6 border-t border-gray-100"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Gift className="w-4 h-4 text-rose-500" />
                                      <h4 className="text-sm font-bold text-gray-800">Complete the Surprise!</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">
                                      Words are beautiful, but gifts make them unforgettable. <span className="text-rose-600 font-medium">Don't let your proposal be just a message.</span>
                                    </p>
                                    
                                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                                      {upsellProducts.slice(0, 4).map((product: any) => (
                                        <Link 
                                          key={product._id}
                                          href="/planning/abuja"
                                          className="flex-shrink-0 w-28 rounded-xl overflow-hidden border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all bg-white"
                                        >
                                          <div className="aspect-square relative bg-gray-50">
                                            {getFirstImage(product.mediaGallery) ? (
                                              <Image
                                                src={getFirstImage(product.mediaGallery)!}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                                            )}
                                          </div>
                                          <div className="p-2">
                                            <p className="text-[10px] font-medium text-gray-800 line-clamp-1">{product.name}</p>
                                            <p className="text-[10px] font-bold text-rose-600">₦{product.basePrice.toLocaleString()}</p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                    
                                    <Button 
                                      asChild
                                      className="w-full mt-3 h-10 text-white text-sm font-bold rounded-xl"
                                      style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
                                    >
                                      <Link href="/planning/abuja">
                                        Browse All Gifts <ArrowRight className="ml-2 w-4 h-4" />
                                      </Link>
                                    </Button>
                                  </motion.div>
                                )}

                                <Button variant="ghost" className="w-full" onClick={() => {
                                    setStep(1);
                                    setGeneratedLink('');
                                    setFormData({ proposerName: '', proposerEmail: '', partnerName: '', message: '', theme: 'classic-red' });
                                }}>
                                    Create Another one
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
             </motion.div>

             {/* Right: History Panel */}
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
             >
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-bold text-gray-800">Your Proposals</h3>
                </div>

                <div className="space-y-4">
                  {previousProposals.length === 0 ? (
                    <div className="bg-white/50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Your sent proposals will appear here.</p>
                    </div>
                  ) : (
                    previousProposals.map((prop, i) => {
                      const isRevealed = revealedIds.has(prop._id) || prop.status === 'PENDING';
                      const hasResponse = prop.status !== 'PENDING';
                      
                      return (
                      <motion.div 
                        key={prop._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className={cn(
                          "border-0 shadow-lg overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                          !hasResponse ? "bg-white border-l-4 border-amber-400" :
                          !isRevealed ? "bg-gradient-to-br from-purple-50 to-indigo-100 border-l-4 border-purple-400" :
                          prop.status === 'ACCEPTED' ? "bg-gradient-to-br from-rose-50 to-pink-100 border-l-4 border-rose-500" :
                          "bg-gradient-to-br from-slate-50 to-gray-200 border-l-4 border-slate-400"
                        )}>
                          <div className="p-5 flex items-start justify-between relative overflow-hidden">
                            {/* Ambient background icons */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                              {!hasResponse ? <Mail className="w-32 h-32 fill-amber-500" /> :
                               !isRevealed ? <Sparkles className="w-32 h-32 fill-purple-500" /> :
                               prop.status === 'ACCEPTED' ? <Heart className="w-32 h-32 fill-rose-500" /> : 
                               <XCircle className="w-32 h-32 fill-slate-500" />}
                            </div>

                            <div className="flex flex-col relative z-10 grow mr-4">
                              <div className="flex items-center gap-2 mb-1">
                                {!hasResponse ? (
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                ) : !isRevealed ? (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Mail className="w-3 h-3 text-purple-500" />
                                  </motion.div>
                                ) : prop.status === 'ACCEPTED' ? (
                                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-slate-400" />
                                )}
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {!hasResponse ? "Sent with Hope" : 
                                   !isRevealed ? "Response Received! ✨" :
                                   prop.status === 'ACCEPTED' ? "A Romantic Success" : 
                                   "A Quiet Moment"}
                                </span>
                              </div>
                              
                              <h4 className="text-sm font-bold text-gray-800 mb-0.5">
                                {!hasResponse ? "A Special Invite for " : 
                                 !isRevealed ? "Message for " :
                                 prop.status === 'ACCEPTED' ? "Forever Yours, " : 
                                 "In Retrospect, "}{prop.partnerName}
                              </h4>
                              
                              <p className="text-xs text-gray-500 italic line-clamp-2 leading-relaxed mb-3">
                                "{prop.message}"
                              </p>

                              <div className="flex items-center gap-3">
                                {/* Show status badge only if revealed or pending */}
                                {(isRevealed || !hasResponse) && (
                                  <div className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    prop.status === 'ACCEPTED' ? "bg-rose-500/10 border-rose-200 text-rose-600" :
                                    prop.status === 'REJECTED' ? "bg-slate-500/10 border-slate-200 text-slate-600" :
                                    "bg-amber-500/10 border-amber-200 text-amber-600"
                                  )}>
                                    {prop.status}
                                  </div>
                                )}
                                {!isRevealed && hasResponse && (
                                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-500/10 border-purple-200 text-purple-600">
                                    Tap to reveal!
                                  </div>
                                )}
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <History className="w-2.5 h-2.5" />
                                  {new Date(prop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 relative z-10">
                              {/* View Response button for unrevealed responses */}
                              {hasResponse && !isRevealed ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button 
                                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-lg"
                                    onClick={() => setActiveReveal(prop)}
                                  >
                                    View Response 💌
                                  </Button>
                                </motion.div>
                              ) : (
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="w-9 h-9 rounded-full bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:bg-white hover:text-rose-500 transition-colors"
                                  onClick={() => window.open(`${window.location.origin}/proposal/${prop._id}`, '_blank')}
                                  title="View Page"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {isRevealed && prop.status === 'ACCEPTED' ? (
                            <div className="bg-rose-500/5 px-5 py-3 border-t border-rose-100 flex flex-col gap-3 relative z-10">
                              {prop.reactionVideoUrl ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center animate-bounce">
                                      <Video className="w-3.5 h-3.5 text-rose-600" />
                                    </div>
                                    <span className="text-[11px] text-rose-800 font-bold tracking-tight">She shared a reaction! 🎉</span>
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="h-8 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm w-full" 
                                      >
                                        Watch Video
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-white/10">
                                      <DialogTitle className="sr-only">Reaction Video</DialogTitle>
                                      <div className="relative aspect-[9/16] w-full bg-black">
                                        <video 
                                          src={prop.reactionVideoUrl} 
                                          controls 
                                          className="w-full h-full object-contain"
                                          autoPlay
                                        />
                                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-70 pointer-events-none">
                                            <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                                                <img 
                                                  src="/icon.png" 
                                                  alt="Tachpae" 
                                                  className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-white font-black text-xs shadow-black drop-shadow-md tracking-wide">Tachpae</span>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 opacity-70">
                                  <span className="text-[11px] text-rose-800 font-medium">✨ Accepted, but no video reaction yet.</span>
                                </div>
                              )}
                              
                              {/* Share Love Story Button */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold w-full mt-2"
                                onClick={() => {
                                  setActiveReveal(prop);
                                  setShowShareCard(true);
                                }}
                              >
                                Share Love Story 💕
                              </Button>
                            </div>
                          ) : isRevealed && prop.status === 'REJECTED' ? (
                            <div className="bg-slate-100/50 px-5 py-3 border-t border-slate-200 flex flex-col gap-1 relative z-10">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                </div>
                                <span className="text-[11px] text-slate-700 font-bold">A thoughtful response...</span>
                              </div>
                              <p className="text-[11px] text-slate-500 italic pl-8">
                                "{prop.rejectionReason || "No message left, but hope remains."}"
                              </p>
                              
                              {/* Share Story Button */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold w-full mt-2"
                                onClick={() => {
                                  setActiveReveal(prop);
                                  setShowShareCard(true);
                                }}
                              >
                                Share Story 💔
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-amber-50/30 px-5 py-3 border-t border-amber-100 flex items-center justify-between relative z-10">
                              <span className="text-[11px] text-amber-700 font-medium">✨ Waiting for butterflies...</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-[10px] text-amber-800 hover:bg-amber-100 font-bold"
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({
                                      title: 'A Surprise for You',
                                      text: `Hi ${prop.partnerName}, I have a surprise for you!`,
                                      url: `${window.location.origin}/proposal/${prop._id}`
                                    });
                                  } else {
                                    copyToClipboard();
                                  }
                                }}
                              >
                                Reshare link
                              </Button>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    )})
                  )}
                </div>
             </motion.div>
        </div>
        
        {/* Response Reveal Modal */}
        {activeReveal && (
          <ResponseReveal
            isOpen={!!activeReveal}
            onClose={() => {
              // Mark as revealed and close
              setRevealedIds(prev => new Set([...prev, activeReveal._id]));
              setActiveReveal(null);
            }}
            status={activeReveal.status}
            partnerName={activeReveal.partnerName}
            proposerName={activeReveal.proposerName || formData.proposerName}
            rejectionReason={activeReveal.rejectionReason}
            reactionVideoUrl={activeReveal.reactionVideoUrl}
            onShareClick={() => {
              setRevealedIds(prev => new Set([...prev, activeReveal._id]));
              setShowShareCard(true);
            }}
          />
        )}
        
        {/* Share Card Modal */}
        <ShareCard
          proposerName={activeReveal?.proposerName || formData.proposerName || 'You'}
          partnerName={activeReveal?.partnerName || 'Partner'}
          message={activeReveal?.message || ''}
          isOpen={showShareCard}
          onClose={() => {
            setShowShareCard(false);
            setActiveReveal(null);
          }}
          status={activeReveal?.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED'}
          rejectionReason={activeReveal?.rejectionReason}
          perspective="sender"
        />
    </div>
  );
}

