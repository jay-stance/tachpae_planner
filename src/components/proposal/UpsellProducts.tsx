'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Helper to detect video URLs
const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

// Get the first image from a media gallery
const getFirstImage = (mediaGallery: string[] = []) => {
  return mediaGallery.find(url => !isVideoUrl(url)) || null;
};

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  mediaGallery?: string[];
  description?: string;
}

interface UpsellProductsProps {
  products: Product[];
  citySlug?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export default function UpsellProducts({ 
  products, 
  citySlug = 'abuja',
  title = "While you're here...",
  subtitle = "Why not treat yourself to something special?",
  ctaText = "Explore More Gifts"
}: UpsellProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Sparkles className="w-3 h-3" style={{ color: 'var(--tachpae-secondary)' }} />
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--tachpae-secondary)' }}>Recommended For You</span>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white mb-1">{title}</h3>
        <p className="text-white/50 text-sm">{subtitle}</p>
      </div>

      {/* Products Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-3 px-3 no-scrollbar">
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
            className="flex-shrink-0 w-40 md:w-48"
          >
            <Link href={`/planning/${citySlug}`}>
              <div 
                className="rounded-2xl overflow-hidden border border-white/10 transition-all hover:scale-105 hover:border-white/20"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {/* Image */}
                <div className="aspect-square relative bg-black/20">
                  {getFirstImage(product.mediaGallery) ? (
                    <Image
                      src={getFirstImage(product.mediaGallery)!}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h4 className="text-white font-bold text-sm line-clamp-1">{product.name}</h4>
                  <p className="font-bold text-sm mt-1" style={{ color: 'var(--tachpae-secondary)' }}>
                    ₦{product.basePrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center mt-4">
        <Button
          asChild
          className="rounded-full px-6 h-10 text-white font-bold text-sm border-0"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          <Link href={`/planning/${citySlug}`}>
            {ctaText} <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
