'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Sparkles, CreditCard, ArrowRight, PenTool } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WishlistDisplayProps {
  products: any[];
  items: { id: string; q: number }[];
}

export default function WishlistDisplay({ products, items }: WishlistDisplayProps) {
  const { addItem, clearCart } = useCart();
  const router = useRouter();

  const getProductData = (id: string) => products.find(p => p._id === id);

  const wishlistItems = items.map(item => {
    const product = getProductData(item.id);
    // Special handling for surprise box
    if (!product && item.id === 'surprise-box') {
      return {
        id: 'surprise-box',
        name: 'Self-Love Curiosity Box',
        price: 50000, 
        quantity: item.q,
        image: null
      };
    }
    return product ? {
      id: product._id,
      name: product.name,
      price: product.basePrice,
      quantity: item.q,
      image: product.mediaGallery?.[0]
    } : null;
  }).filter(Boolean);

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-rose-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center rounded-[3rem] shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <ShoppingBag className="w-20 h-20 mx-auto text-rose-200 mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Bundle Not Found</h2>
          <p className="text-gray-500 font-medium mb-8">This shared bundle link might be outdated or invalid.</p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black"
          >
            Start Planning
          </Button>
        </Card>
      </div>
    );
  }

  const total = wishlistItems.reduce((sum, item) => sum + (item!.price * item!.quantity), 0);

  const handleAction = (type: 'pay' | 'customize') => {
    clearCart();
    wishlistItems.forEach(item => {
      if (item) {
        addItem({
          productId: item.id,
          productName: item.name,
          productImage: item.image || undefined,
          basePrice: item.price,
          quantity: item.quantity,
          variantSelection: {},
          customizationData: {}
        });
      }
    });

    // Default to Abuja for now, ideally this comes from the wishlist metadata if we stored it
    const citySlug = 'abuja'; 
    if (type === 'pay') {
        router.push(`/planning/${citySlug}?checkout=true`);
    } else {
        router.push(`/planning/${citySlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-rose-100 selection:text-rose-900">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-rose-200/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-indigo-200/20 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 mb-8 md:mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
             <div className="relative transform scale-75 md:scale-100">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100/50 flex items-center justify-center text-rose-600 rotate-3 transition-transform hover:rotate-6 duration-500">
                    <Heart className="w-10 h-10 fill-rose-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    FOR YOU
                </div>
             </div>
             <div>
                <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-2 md:mb-4">
                    A Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">Expression.</span>
                </h1>
                <p className="text-gray-500 text-sm md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
                    Someone special crafted this experience just for you. Review the details below.
                </p>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
                {wishlistItems.map((item, idx) => item && (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="h-full"
                    >
                        <Card className="h-full border-0 bg-white shadow-lg shadow-gray-100/50 rounded-3xl p-3 md:p-6 flex flex-col md:flex-row gap-3 md:gap-6 group hover:shadow-xl transition-all duration-300">
                            <div className="w-full md:w-32 aspect-square md:h-32 relative rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-300 bg-rose-50/50">
                                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2" />
                                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-rose-400">Surprise</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="text-sm md:text-xl font-black text-gray-900 leading-tight mb-1 md:mb-2 group-hover:text-rose-600 transition-colors line-clamp-2 md:line-clamp-none">{item.name}</h3>
                                    <p className="text-[10px] md:text-sm text-gray-400 font-medium line-clamp-2 hidden md:block">Includes premium packaging and handling.</p>
                                </div>
                                <div className="flex items-center justify-between mt-2 md:mt-0">
                                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] md:text-xs font-bold text-gray-500 border border-gray-100">
                                        Qty: {item.quantity}
                                    </div>
                                    <div className="text-sm md:text-2xl font-black text-gray-900">₦{item.price.toLocaleString()}</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
                </div>
            </div>

            {/* Action Card (Sticky on Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8">
                <Card className="border-0 bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 blur-[80px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="relative space-y-8">
                        <div>
                            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Value</div>
                            <div className="text-5xl md:text-6xl font-black tracking-tighter">₦{total.toLocaleString()}</div>
                            <div className="mt-2 text-sm text-gray-400 font-medium">Taxes and fees calculated at checkout</div>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                onClick={() => handleAction('pay')}
                                className="w-full h-16 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-between px-6 group"
                            >
                                <span>Pay Now</span>
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </Button>

                            <Button 
                                onClick={() => handleAction('customize')}
                                className="w-full h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg border border-gray-700 active:scale-95 transition-all flex items-center justify-between px-6 group"
                            >
                                <span>Customize</span>
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                                    <PenTool className="w-4 h-4" />
                                </div>
                            </Button>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-800">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-xs font-bold text-gray-400">Secure Checkout via Tachpae</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
