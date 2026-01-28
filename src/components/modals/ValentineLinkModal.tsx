'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, Link as LinkIcon, Copy, Check } from 'lucide-react';
import ConversionModal from './ConversionModal';

interface ValentineLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onCreateLink: (partnerName: string, message: string) => void;
}

/**
 * Valentine Link Modal
 * Shown: On second visit only (tracked via localStorage)
 * Purpose: Encourage Valentine link creation
 */
export default function ValentineLinkModal({
  isOpen,
  onClose,
  onDismiss,
  onCreateLink,
}: ValentineLinkModalProps) {
  const [partnerName, setPartnerName] = useState('');
  const [message, setMessage] = useState('');
  const [linkCreated, setLinkCreated] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!partnerName.trim()) return;
    
    // Generate a mock link (actual implementation would create real link)
    const link = `https://val.tachpae.com/${encodeURIComponent(partnerName.toLowerCase().replace(/\s+/g, '-'))}-${Date.now().toString(36)}`;
    setCreatedLink(link);
    setLinkCreated(true);
    onCreateLink(partnerName, message);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = createdLink;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    // Reset state
    setPartnerName('');
    setMessage('');
    setLinkCreated(false);
    setCreatedLink('');
    onClose();
  };

  return (
    <ConversionModal isOpen={isOpen} onClose={handleClose} onDismiss={onDismiss}>
      <div className="space-y-5 pt-2">
        {!linkCreated ? (
          <>
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Ready to Make It Special? 💕
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Create your Valentine link now — when your special person receives your gift, 
                it'll come with a personalized love message just from you!
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Partner's Name *
                </label>
                <Input
                  placeholder="e.g., My Love, Babe, Sweetheart..."
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="h-12 rounded-xl border-2 focus:border-rose-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Your Sweet Message (Optional)
                </label>
                <Textarea
                  placeholder="Write something special for them..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl border-2 focus:border-rose-500 min-h-[80px]"
                />
              </div>
            </div>

            {/* Preview hint */}
            <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700">
                Your link will reveal your message beautifully when they open it on Valentine's Day!
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Button
                onClick={handleCreate}
                disabled={!partnerName.trim()}
                className="w-full h-14 text-lg rounded-2xl bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-200 disabled:opacity-50"
              >
                Generate My Link <LinkIcon className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-gray-400 font-bold"
              >
                Maybe Later
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Your link is ready! 🎉
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Share this link with <span className="font-bold text-rose-600">{partnerName}</span> on Valentine's Day!
              </p>
            </div>

            {/* Link Display */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 break-all font-mono">
                {createdLink}
              </p>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              className={`w-full h-14 text-lg rounded-2xl font-black shadow-lg ${
                copied 
                  ? 'bg-green-600 hover:bg-green-600 shadow-green-200' 
                  : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 w-5 h-5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 w-5 h-5" /> Copy Link
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-gray-400 font-bold"
            >
              Done
            </Button>
          </>
        )}
      </div>
    </ConversionModal>
  );
}
