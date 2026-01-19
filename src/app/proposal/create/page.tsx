'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Copy, ArrowRight, Check, History, ExternalLink, Mail, User } from 'lucide-react';
import { createProposal, getProposalsByDeviceId } from '@/actions/proposal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

  if (!isMounted) return null; // Prevent hydration mismatch

  const handleSubmit = async () => {
    if (!formData.proposerName || !formData.partnerName || !formData.message) return;
    
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
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-pink-50 via-white to-red-50 p-4 md:p-8 relative overflow-x-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             
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
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600">
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
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Your Email (Optional - for notifications)</label>
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
                                        className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Will you be my Valentine? I promise to..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>

                                <Button 
                                    className="w-full h-12 text-lg mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-xl shadow-red-100 rounded-xl"
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.message || !formData.partnerName}
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
                    previousProposals.map((prop, i) => (
                      <motion.div 
                        key={prop._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg bg-white/80 overflow-hidden group">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">To: {prop.partnerName}</span>
                              <span className="text-sm font-semibold text-gray-800 line-clamp-1">{prop.message}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                  prop.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                  prop.status === 'ACCEPTED' ? "bg-green-100 text-green-700" :
                                  "bg-gray-100 text-gray-700"
                                )}>
                                  {prop.status}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(prop.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="rounded-full hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => window.open(`${window.location.origin}/proposal/${prop._id}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                          {prop.status === 'ACCEPTED' && prop.reactionVideoUrl && (
                            <div className="bg-green-50 px-4 py-2 border-t border-green-100 flex items-center justify-between">
                              <span className="text-xs text-green-700 font-medium">✨ Reaction Video Ready!</span>
                              <Button variant="link" size="sm" className="text-xs text-green-800 h-auto p-0" onClick={() => window.open(prop.reactionVideoUrl, '_blank')}>
                                View Reaction
                              </Button>
                            </div>
                          )}
                          {prop.status === 'REJECTED' && prop.rejectionReason && (
                            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                              <span className="text-xs text-gray-600 font-medium italic italic">"{prop.rejectionReason}"</span>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
             </motion.div>
        </div>
    </div>
  );
}

