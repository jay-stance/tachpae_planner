'use client';

import React, { useRef, useState } from 'react';
import { Download, Share2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareCardProps {
  proposerName: string;
  partnerName: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  status?: 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
}

export default function ShareCard({ proposerName, partnerName, message, isOpen, onClose, status = 'ACCEPTED', rejectionReason }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateCard = async () => {
    setGenerating(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (Instagram story size)
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0A0A12');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0A0A12');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative circles
    ctx.beginPath();
    ctx.arc(200, 300, 300, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(53, 20, 245, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(880, 1600, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 128, 0.1)';
    ctx.fill();

    // Heart icon area
    ctx.beginPath();
    ctx.arc(540, 500, 120, 0, Math.PI * 2);
    
    if (status === 'REJECTED') {
      ctx.fillStyle = '#334155'; // Slate-700
      ctx.fill();
      
      // Broken Heart emoji
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💔', 540, 530);

      // "I said NO" text
      ctx.font = 'bold 90px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('I said NO', 540, 720);
    } else {
      const heartGradient = ctx.createLinearGradient(420, 380, 660, 620);
      heartGradient.addColorStop(0, '#3514F5');
      heartGradient.addColorStop(1, '#FF0080');
      ctx.fillStyle = heartGradient;
      ctx.fill();

      // Heart emoji
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💕', 540, 530);

      // "I said YES!" text
      ctx.font = 'bold 90px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('I said YES!', 540, 720);
    }

    // Proposer name
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`to ${proposerName}'s proposal`, 540, 800);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(340, 880);
    ctx.lineTo(740, 880);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // The message (or rejection reason)
    ctx.font = 'italic 40px Georgia';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    
    // Choose text to display: The proposal message OR the rejection reason?
    // User said "Ensure the card gracefully depicts the NO, with the reason"
    const textToDisplay = status === 'REJECTED' && rejectionReason 
        ? `Reason: ${rejectionReason}` 
        : message;

    // Word wrap the message
    const maxWidth = 900;
    const lineHeight = 55;
    const words = textToDisplay.split(' ');
    let line = '';
    let y = 980;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(`"${line.trim()}"`, 540, y);
        line = words[n] + ' ';
        y += lineHeight;
        if (y > 1200) break; // Limit text height
      } else {
        line = testLine;
      }
    }
    if (line.trim() && y <= 1200) {
      ctx.fillText(`"${line.trim()}"`, 540, y);
    }

    // Partner response signature (only for Yes?) or generic
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = status === 'REJECTED' ? '#cbd5e1' : '#FF69B4';
    ctx.fillText(`- ${partnerName} ${status === 'REJECTED' ? '' : '💝'}`, 540, y + 100);

    // Tachpae branding
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Create yours at', 540, 1650);
    
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('val.tachpae.com', 540, 1720);

    // Tachpae logo text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('@tachpae', 540, 1800);

    // Generate image URL
    const dataUrl = canvas.toDataURL('image/png');
    setImageUrl(dataUrl);
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `love-story-${proposerName}-${partnerName}.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'love-story.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'I said YES! 💕',
          text: `I just said YES to ${proposerName}'s Valentine proposal on Tachpae!`,
        });
      } else {
        // Fallback - download
        handleDownload();
      }
    } catch (error) {
      console.error('Share failed:', error);
      handleDownload();
    }
  };

  // Generate on open
  React.useEffect(() => {
    if (isOpen && !imageUrl) {
      generateCard();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Share Your Love Story 💕</h3>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Canvas (hidden, for generation) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview */}
            <div className="rounded-2xl overflow-hidden mb-4 bg-black">
              {generating ? (
                <div className="aspect-[9/16] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Share card preview" 
                  className="w-full"
                />
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                disabled={generating}
                className="flex-1 h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ backgroundColor: '#25D366' }}
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={handleDownload}
                disabled={generating}
                className="flex-1 h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 border-2 border-white/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Download className="w-5 h-5" />
                Save
              </button>
            </div>

            <p className="text-center text-white/40 text-xs mt-4">
              Tag @tachpae on Instagram & TikTok!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
