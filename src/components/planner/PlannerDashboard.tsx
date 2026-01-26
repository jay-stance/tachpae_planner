'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ProductConfigurator from '@/components/products/ProductConfigurator';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useEvent } from '@/context/EventContext';
import { ShoppingBag, Gift, Calendar, Heart, Share2, Package, CheckCircle, Sparkles, ArrowRight, Copy, MessageCircle, Filter, X, MapPin, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { toast } from 'sonner';
import { sendEvent } from '@/lib/analytics';
// Helper to detect video URLs
const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

// Get the first image from a media gallery, or null if none
const getFirstImage = (mediaGallery: string[] = []) => {
  return mediaGallery.find(url => !isVideoUrl(url)) || null;
};

// Get the first video from a media gallery, or null if none
const getFirstVideo = (mediaGallery: string[] = []) => {
  return mediaGallery.find(url => isVideoUrl(url)) || null;
};

interface PlannerDashboardProps {
  data: {
    city: any;
    categories: any[];
    products: any[];
    services: any[];
    addons?: any[];
    allCities?: any[];
    bundles?: any[];
  }
}

export default function PlannerDashboard({ data }: PlannerDashboardProps) {
  // ... (existing hooks)
  const router = useRouter();
  const searchParams = useSearchParams();
  const { city, categories, products, services, addons = [], bundles = [] } = data;
  const { itemCount, totalAmount, addItem, getShareableLink } = useCart();
  const { event } = useEvent();
  
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [logisticsAgreed, setLogisticsAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>({ _id: 'bundles', name: 'Bundles' });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';
  React.useEffect(() => {
    if (activeCategory?._id) {
      sendEvent({
        action: 'view_item_list',
        category: 'Navigation',
        label: activeCategory.name || activeCategory._id
      });
    }
  }, [activeCategory]);



  // Track Cart Open
  const openCart = () => {
    sendEvent({ action: 'view_cart', category: 'Interaction', label: 'Cart Drawer' });
    setCartOpen(true);
  };


  // const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [cartView, setCartView] = React.useState<'cart' | 'checkout'>('cart');

  // Auto-open cart if ?openCart=true
  React.useEffect(() => {
    if (searchParams?.get('openCart') === 'true') {
      setCartView('checkout');
      setCartOpen(true);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Toast on location change
  React.useEffect(() => {
    if (city?.name) {
      toast.success(`You are browsing items available in ${city.name}`, {
        icon: '📍',
        duration: 4000
      });
    }
  }, [city?.name]);

  // Sort categories by local relevance
  const sortedCategories = React.useMemo(() => {
    if (!city?._id || !categories || !products) return categories;

    return [...categories].sort((a, b) => {
      // Calculate scores: +1 for every product in this category that explicitly matches this city location
      const getScore = (catId: string) => {
        let score = 0;
        const catProds = products.filter((p: any) => (p.category?._id || p.category) === catId);
        
        catProds.forEach((p: any) => {
          // If product explicitly targets this city (not just global/empty locations)
          if (p.locations && p.locations.includes(city._id)) {
            score += 10; // High weight for location-specific
          } else if (!p.locations || p.locations.length === 0) {
            score += 1; // Default visibility
          }
        });
        return score;
      };

      const scoreA = getScore(a._id);
      const scoreB = getScore(b._id);
      
      return scoreB - scoreA; // Descending order
    });
  }, [categories, products, city?._id]);

  const getProductsByCategory = (catId: string) => products.filter((p: any) => 
    (p.category?._id || p.category) === catId
  );

  const handleProductClick = (product: any) => {
    sendEvent({
      action: 'select_item',
      category: product.isBundle ? 'Bundle' : 'Product',
      label: product.name,
      value: product.basePrice,
      items: [{ item_id: product._id, item_name: product.name }]
    });
    setSelectedProduct(product);
  };

  const handleAddToCart = (config: any) => {
    if (!selectedProduct) return;
    
    sendEvent({
      action: 'add_to_cart',
      category: 'Product',
      label: selectedProduct.name,
      value: config.totalPrice || selectedProduct.basePrice,
      items: [{ item_id: selectedProduct._id, item_name: selectedProduct.name }]
    });
    
    addItem({
      productId: selectedProduct._id,
      type: 'PRODUCT',
      productName: selectedProduct.name,
      productImage: getFirstImage(selectedProduct.mediaGallery) || selectedProduct.mediaGallery?.[0],
      basePrice: config.totalPrice || selectedProduct.basePrice,
      quantity: 1,
      variantSelection: config.variants || {},
      customizationData: config.wizardData || {},
    });

    
    setSelectedProduct(null);
  };

  const handleLogisticsAgree = () => {
    setLogisticsAgreed(true);
    addItem({
      productId: 'logistics-fee',
      type: 'SERVICE',
      productName: 'Custom Logistics Handling Fee',
      basePrice: 2000,
      quantity: 1,
      variantSelection: {},
      customizationData: {},
    });
  };

  const handleShareWishlist = async () => {
    const link = getShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = link;
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

  const handleBundleAddToCart = (bundle: any) => {
    sendEvent({
      action: 'add_to_cart',
      category: 'Bundle',
      label: bundle.name,
      value: bundle.basePrice,
      items: [{ item_id: bundle._id, item_name: bundle.name }]
    });

    addItem({
      productId: bundle._id,
      type: 'BUNDLE',
      productName: bundle.name,
      productImage: bundle.mediaGallery?.[0] || bundle.bundleItems?.[0]?.productImage || '', // Fallback safely
      basePrice: bundle.basePrice,
      quantity: 1,
      variantSelection: {},
      customizationData: {},
    });
    toast.success("Bundle added to cart! 🎁");
  };



  const shouldShowProduct = (p: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'budget') return p.basePrice <= 25000;
    if (activeFilter === 'luxury') {
      return p.tags?.includes('luxury') || 
             p.tags?.includes('grand-gesture') || 
             p.tierLabel === 'grandGesture' ||
             p.basePrice >= 80000;
    }
    return p.tags?.includes(activeFilter);
  };

  return (
    <div className="w-full min-h-screen bg-white pb-24 md:pb-32">
      <Header className="border-b border-gray-100" variant="light" />
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-12">

        <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="px-2 md:px-3 py-1 bg-rose-50 rounded-full border border-rose-100 flex items-center gap-1.5 md:gap-2">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-600">Location</span>
                <select 
                  value={city.slug}
                  onChange={(e) => router.push(`/planning/${e.target.value}`)}
                  className="text-[11px] md:text-xs font-bold text-rose-600 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value={city.slug}>{city.name}</option>
                  {data.allCities?.map((c: any) => c.slug !== city.slug && (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">Curate Your Package</h1>
            <p className="text-gray-500 text-sm md:text-lg max-w-xl font-medium">Select gifts, experiences, and more for your Valentine.</p>
          </div>
          
          {/* share wishlist */}
          {/* <Button 
            variant="outline" 
            className="h-12 px-6 rounded-2xl border-2 font-black border-gray-100 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-3"
            onClick={handleShareWishlist}
          >
            {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5 text-rose-600" />}
            {copied ? 'Copied!' : 'Share Wishlist'}
          </Button> */}
        </header>

        {/* Urgency Banner - Psychological triggers */}
        <div className="mb-6 md:mb-8 p-3 md:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-rose-100 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            {/* Urgency Message */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl animate-pulse">⏰</span>
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-rose-900">
                  Valentine's Day is {Math.max(0, Math.ceil((new Date('2026-02-14').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days away!
                </p>
                <p className="text-[10px] md:text-xs text-rose-700/80">
                  🔥 Popular items sell out fast. Secure yours now.
                </p>
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full border border-rose-100">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center text-[8px]">💕</div>
                <div className="w-5 h-5 rounded-full bg-pink-200 flex items-center justify-center text-[8px]">🎁</div>
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-[8px]">❤️</div>
              </div>
              <span className="text-[10px] md:text-xs font-bold text-rose-800">10,000+ couples trust us</span>
            </div>
          </div>
        </div>

        {/* Delivery Confidence Strip */}
        <div className="mb-8 flex flex-wrap justify-center gap-y-2 gap-x-6 md:gap-8 text-[10px] md:text-sm font-bold text-gray-500 bg-white/50 p-3 rounded-xl backdrop-blur-sm border border-gray-100">
           <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-green-600"/> Guaranteed Delivery</span>
           <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-600"/> Delivered in {city.name}</span>
           <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-purple-600"/> 100% Satisfaction</span>
        </div>

        {/* Categories Tabs */}
        <div className="mb-6 md:mb-12 sticky top-2 md:top-4 z-40 bg-white/90 backdrop-blur-xl p-1 md:p-1.5 rounded-2xl md:rounded-3xl border border-gray-100 md:border-2 md:border-gray-50 shadow-lg md:shadow-xl shadow-gray-100/50 flex flex-nowrap gap-0.5 md:gap-2 w-fit max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory({ _id: 'bundles', name: 'Bundles' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                activeCategory?._id === 'bundles'
                  ? "text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
              style={activeCategory?._id === 'bundles' ? { background: 'var(--tachpae-primary)', boxShadow: '0 4px 14px rgba(53, 20, 245, 0.25)' } : {}}
            >
              <Package className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Curated Bundles
            </button>
            <button
              onClick={() => setActiveCategory({ _id: 'gifts', name: 'Gifts' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                (activeCategory?._id === 'gifts' || !['experiences', 'specials', 'bundles'].includes(activeCategory?._id))
                  ? "text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
              style={(activeCategory?._id === 'gifts' || !['experiences', 'specials', 'bundles'].includes(activeCategory?._id)) ? { background: 'var(--tachpae-primary)', boxShadow: '0 4px 14px rgba(53, 20, 245, 0.25)' } : {}}
            >
              <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Gifts
            </button>
                        <button
              onClick={() => setActiveCategory({ _id: 'specials', name: 'Specials' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                activeCategory?._id === 'specials'
                  ? "text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
              style={activeCategory?._id === 'specials' ? { background: 'var(--tachpae-primary)', boxShadow: '0 4px 14px rgba(53, 20, 245, 0.25)' } : {}}
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Specials
            </button>

            <button
              onClick={() => setActiveCategory({ _id: 'experiences', name: 'Experiences' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                activeCategory?._id === 'experiences'
                  ? "text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
              style={activeCategory?._id === 'experiences' ? { background: 'var(--tachpae-primary)', boxShadow: '0 4px 14px rgba(53, 20, 245, 0.25)' } : {}}
            >
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Experiences
            </button>
        </div>

        {/* Smart Filters */}
        {/* Dynamic Tag Filters */}
        {activeCategory?._id !== 'specials' && activeCategory?._id !== 'experiences' && activeCategory?._id !== 'bundles' && (
          <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-100 min-w-max px-1">
             <button 
               onClick={() => setActiveFilter('all')}
               className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap", activeFilter === 'all' ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}
             >
               All Items
             </button>
             
             {['popular', 'budget', 'luxury', 'romantic', 'for-her', 'for-him', 'self-love', 'unique', 'personalized'].map((tag) => {
                // Determine styling based on tag
               const isActive = activeFilter === tag;
               let styleClass = "bg-white text-gray-500 border-gray-200 hover:border-gray-300";
               let activeClass = "bg-gray-900 text-white border-gray-900";
               let icon = "🏷️";
               let label = tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ');

               if (tag === 'popular') { icon = "🔥"; label="Best Sellers"; if(isActive) activeClass = "bg-rose-500 text-white border-rose-500"; }
               else if (tag === 'budget') { icon = "💰"; label="Under ₦25k"; if(isActive) activeClass = "bg-green-500 text-white border-green-500"; }
               else if (tag === 'luxury') { icon = "💎"; label="Luxury Picks"; if(isActive) activeClass = "bg-purple-600 text-white border-purple-600"; }
               else if (tag === 'romantic') { icon = "💕"; if(isActive) activeClass = "bg-pink-500 text-white border-pink-500"; }
               else if (tag === 'for-her') { icon = "👸"; if(isActive) activeClass = "bg-rose-400 text-white border-rose-400"; }
               else if (tag === 'for-him') { icon = "🧔"; if(isActive) activeClass = "bg-blue-600 text-white border-blue-600"; }
               else if (tag === 'self-love') { icon = "✨"; if(isActive) activeClass = "bg-yellow-500 text-white border-yellow-500"; }
               else if (tag === 'unique') { icon = "🦄"; if(isActive) activeClass = "bg-indigo-500 text-white border-indigo-500"; }
               else if (tag === 'personalized') { icon = "✍️"; if(isActive) activeClass = "bg-teal-500 text-white border-teal-500"; }

               return (
                 <button 
                   key={tag}
                   onClick={() => setActiveFilter(tag)}
                   className={cn(
                     "px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap", 
                     isActive ? (activeClass + " shadow-md scale-105") : styleClass
                   )}
                 >
                   <span>{icon}</span> {label}
                 </button>
               );
             })}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeCategory?._id === 'specials' ? (
            <div className="space-y-24 pb-8">
              {/* SURPRISE YOURSELF - DARK THEME */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/10" style={{ background: '#050511' }}>
                {/* Background orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'var(--tachpae-primary)', opacity: 0.25 }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: 'var(--tachpae-secondary)', opacity: 0.2 }} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-0 relative z-10">
                  <div className="p-8 md:p-12 order-2 md:order-1 flex flex-col items-start space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Sparkles className="w-3 h-3" style={{ color: 'var(--tachpae-secondary)' }} />
                        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--tachpae-secondary)' }}>The Mystery Edit</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                      Surprise <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-secondary))' }}>Yourself.</span>
                    </h2>
                    
                    <p className="text-white/60 text-sm md:text-lg max-w-sm leading-relaxed">
                      You don't need a partner to feel butterflies. You deserve a gift too. Let us curate a mystery box of joy, tailored just for you.
                    </p>

                    <Button 
                      asChild
                      className="mt-2 h-12 px-8 rounded-full text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 border-0"
                      style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))', boxShadow: '0 8px 24px rgba(53, 20, 245, 0.4)' }}
                    >
                      <Link href={`/surprise?city=${city?.slug || 'abuja'}`}>
                        Treat Myself <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="relative h-64 md:h-full min-h-[300px] order-1 md:order-2 flex items-center justify-center">
                     {/* Elegant Bouncing Box Animation */}
                     <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            filter: [
                                "drop-shadow(0 0 30px rgba(53, 20, 245, 0.5))", 
                                "drop-shadow(0 0 60px rgba(0, 194, 255, 0.6))", 
                                "drop-shadow(0 0 30px rgba(53, 20, 245, 0.5))"
                            ]
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative z-10"
                     >
                        <span style={{ fontSize: '10rem' }} className="leading-none select-none block">🎁</span>
                        
                        {/* Inner glow hint */}
                        <div className="absolute inset-0 blur-3xl -z-10 rounded-full animate-pulse" style={{ background: 'var(--tachpae-primary)', opacity: 0.4 }} />
                     </motion.div>
                     
                     {/* Floor Shadow */}
                     <motion.div 
                        animate={{ scale: [1, 0.8, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 w-40 h-8 blur-xl rounded-full -z-10"
                        style={{ background: 'var(--tachpae-primary)' }}
                     />
                  </div>
                </div>
              </section>

              {/* OTHER SPECIALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* ADD YOUR OWN GIFT - with visual */}
                 <div className="relative overflow-hidden rounded-[2rem] border border-white/10" style={{ background: '#050511' }}>
                    {/* Background orb */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'var(--tachpae-accent)', opacity: 0.2 }} />
                    
                    {/* Visual - Animated gift boxes combining */}
                    <div className="relative h-48 flex items-center justify-center overflow-hidden">
                      <div className="relative flex items-end justify-center gap-2">
                        {/* Your gift */}
                        <motion.div
                          animate={{ 
                            x: [0, 15, 0],
                            rotate: [-5, 0, -5]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-5xl">🛍️</span>
                          <span className="text-[10px] text-white/40 mt-1 font-bold">YOUR GIFT</span>
                        </motion.div>
                        
                        {/* Plus sign */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="text-2xl font-black mb-4"
                          style={{ color: 'var(--tachpae-secondary)' }}
                        >
                          +
                        </motion.div>
                        
                        {/* Our items */}
                        <motion.div
                          animate={{ 
                            x: [0, -15, 0],
                            rotate: [5, 0, 5]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-5xl">🎁</span>
                          <span className="text-[10px] text-white/40 mt-1 font-bold">OUR ITEMS</span>
                        </motion.div>
                        
                        {/* Equals */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                          className="text-2xl font-black mb-4 ml-2"
                          style={{ color: 'var(--tachpae-secondary)' }}
                        >
                          =
                        </motion.div>
                        
                        {/* Combined delivery */}
                        <motion.div
                          animate={{ 
                            y: [0, -8, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="flex flex-col items-center ml-2"
                        >
                          <span className="text-6xl">📦</span>
                          <span className="text-[10px] font-bold mt-1" style={{ color: 'var(--tachpae-accent)' }}>ONE DELIVERY!</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="relative z-10 p-8 pt-0 space-y-4">
                      <h3 className="text-2xl md:text-3xl font-black text-white">
                        Already Bought <span style={{ color: 'var(--tachpae-accent)' }}>Something?</span>
                      </h3>
                      
                      <p className="text-white/60 font-medium leading-relaxed text-sm">
                        Got something special? Send it to us! We'll package it with your order and deliver everything together as one perfect Valentine's surprise.
                      </p>
                      
                      <Button 
                        variant="ghost"
                        onClick={() => setShowLogisticsModal(true)}
                        className="text-white font-bold p-0 h-auto text-base hover:bg-transparent group"
                        style={{ color: 'var(--tachpae-secondary)' }}
                      >
                        Add My Gift <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                 </div>

                 {/* Be My Val - NOW SECOND */}
                 <div className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8" style={{ background: '#050511' }}>
                    {/* Background orb */}
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: 'var(--tachpae-primary)', opacity: 0.15 }} />
                    
                    <div className="relative z-10 space-y-5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}>
                        <Heart className="w-8 h-8 text-white fill-white" />
                      </div>
                      
                      <h3 className="text-3xl font-black text-white">Be My <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-accent))' }}>Val?</span></h3>
                      
                      <p className="text-white/60 font-medium leading-relaxed">
                        Planning for someone special? Create a digital proposal that builds anticipation and makes the big question unforgettable.
                      </p>
                      
                      <Button 
                        variant="ghost"
                        asChild
                        className="text-white font-bold p-0 h-auto text-base hover:bg-transparent group"
                        style={{ color: 'var(--tachpae-secondary)' }}
                      >
                        <Link href="/proposal/create">
                          Create Proposal Link <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                 </div>
              </div>
            </div>
          ) : activeCategory?._id === 'bundles' ? (
            <div className="space-y-8">
               <div className="text-center max-w-2xl mx-auto mb-12">
                 <h2 className="text-3xl font-black text-gray-900 mb-3">Perfectly Curated Packages</h2>
                 <p className="text-gray-500 font-medium">Why stress? We've combined our best items into perfect bundles to save you time and money.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {bundles.map((bundle: any) => (
                   <div 
                     key={bundle._id} 
                     className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 flex flex-col cursor-pointer"
                     onClick={() => handleProductClick(bundle)}
                   >
                     {/* Image Header with multi-image carousel */}
                     <div className="h-56 relative bg-gray-100 overflow-hidden">
                       {/* Show grid of product images */}
                       <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0.5">
                         {bundle.mediaGallery?.slice(0, 4).map((img: string, idx: number) => (
                           <div key={idx} className={`relative overflow-hidden ${bundle.mediaGallery.length === 1 ? 'col-span-2 row-span-2' : bundle.mediaGallery.length === 2 ? 'row-span-2' : bundle.mediaGallery.length === 3 && idx === 0 ? 'row-span-2' : ''}`}>
                             <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                           </div>
                         ))}
                         {(!bundle.mediaGallery || bundle.mediaGallery.length === 0) && (
                           <div className="col-span-2 row-span-2 flex items-center justify-center text-6xl bg-rose-50">🎁</div>
                         )}
                       </div>
                       
                       {/* Bundle Category Badge */}
                       <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg">
                         {bundle.bundleCategory === 'couples' ? '💖 Couples' :
                          bundle.bundleCategory === 'for-her' ? '🌸 For Her' :
                          bundle.bundleCategory === 'for-him' ? '🧔 For Him' :
                          bundle.bundleCategory === 'self-love' ? '💛 Self-Love' : '🎁 Bundle'}
                       </div>
                       
                       {/* Price Badge */}
                       <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                         <span className="text-lg font-black text-rose-600">₦{bundle.basePrice.toLocaleString()}</span>
                       </div>
                     </div>
                     
                     {/* Content */}
                     <div className="p-5 flex-1 flex flex-col">
                       <h3 className="text-xl font-black text-gray-900 mb-2">{bundle.name}</h3>
                       <p className="text-gray-500 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                       
                       {/* Included Items with proper display */}
                       <div className="mb-5 space-y-2">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">What's Inside:</p>
                         <div className="flex flex-wrap gap-2">
                           {bundle.bundleItems?.map((item: any, idx: number) => (
                             <div 
                               key={idx} 
                               className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100"
                               title={item.productName}
                             >
                               {/* Show image if available in mediaGallery by index */}
                               <div className="w-6 h-6 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                 {bundle.mediaGallery?.[idx] ? (
                                   <Image src={bundle.mediaGallery[idx]} alt="" width={24} height={24} className="object-cover" />
                                 ) : (
                                   <span className="text-[10px]">🎁</span>
                                 )}
                               </div>
                               <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{item.productName}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       {/* Add to Cart */}
                       <div className="mt-auto">
                         <Button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleBundleAddToCart(bundle);
                           }}
                           className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-rose-600 text-white font-bold transition-colors shadow-lg"
                         >
                           Add Bundle to Cart
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               {bundles.length === 0 && (
                 <div className="py-20 text-center bg-gray-50 rounded-[3rem]">
                   <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                   <h3 className="text-xl font-black text-gray-400">No bundles available right now.</h3>
                 </div>
               )}
            </div>
          ) : activeCategory?._id === 'experiences' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {services.map((service: any) => (
                <Card key={service._id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg shadow-gray-100 bg-white overflow-hidden rounded-[2rem]">
                  <div className="h-48 bg-rose-50 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-700">
                    <Calendar className="w-20 h-20 text-rose-200" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-500 font-medium mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-rose-600">₦{service.basePrice.toLocaleString()}</span>
                      <Button 
                         variant="outline" 
                         className="rounded-full font-black text-xs px-6 border-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                         asChild
                      >
                        <a href={service.bookingType === 'DIRECT' ? '#' : service.redirectUrl} target="_blank" rel="noopener noreferrer">
                          Book Now
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {services.length === 0 && (
                <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem]">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <h3 className="text-xl font-black text-gray-400">No experiences in this location yet.</h3>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 md:space-y-16 pb-8 md:pb-12">
              {sortedCategories.map((cat: any) => {
                const catProducts = getProductsByCategory(cat._id).filter(shouldShowProduct);
                if (catProducts.length === 0) return null;
                return (
                  <section key={cat._id} className="space-y-4 md:space-y-8">
                    <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-2 md:gap-4">
                      <span className="text-2xl md:text-4xl">{cat.icon || '🎁'}</span>
                      {cat.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                      {catProducts.map((product: any) => (
                        <Card 
                          key={product._id} 
                          className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-md md:shadow-lg shadow-gray-100 bg-white overflow-hidden rounded-2xl md:rounded-[2rem]" 
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="aspect-square relative overflow-hidden bg-gray-50">
                            {(() => {
                              const firstImage = getFirstImage(product.mediaGallery);
                              const firstVideo = getFirstVideo(product.mediaGallery);
                              
                              let mediaElement;
                              if (firstImage) {
                                mediaElement = (
                                  <Image 
                                    src={firstImage} 
                                    alt={product.name} 
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                                  />
                                );
                              } else if (firstVideo) {
                                mediaElement = (
                                  <video 
                                    src={firstVideo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                );
                              } else {
                                mediaElement = (
                                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">🎁</div>
                                );
                              }

                              return (
                                <>
                                  <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5 items-start max-w-[90%]">
                                    {/* Show up to 3 tags with stylish badges */}
                                    {product.tags?.slice(0, 3).map((tag: string, idx: number) => {
                                      // Map tags to colors and icons
                                      const tagStyles: Record<string, { bg: string, text: string, icon: string, border: string }> = {
                                        'popular': { bg: 'rgba(254, 242, 242, 0.9)', text: '#dc2626', icon: '🔥', border: '#fecaca' },
                                        'luxury': { bg: 'rgba(250, 245, 255, 0.9)', text: '#7e22ce', icon: '💎', border: '#e9d5ff' },
                                        'romantic': { bg: 'rgba(253, 242, 248, 0.9)', text: '#db2777', icon: '💕', border: '#fbcfe8' },
                                        'for-her': { bg: 'rgba(255, 241, 242, 0.9)', text: '#e11d48', icon: '👸', border: '#fda4af' },
                                        'for-him': { bg: 'rgba(239, 246, 255, 0.9)', text: '#2563eb', icon: '👔', border: '#bfdbfe' },
                                        'budget': { bg: 'rgba(240, 253, 244, 0.9)', text: '#16a34a', icon: '💰', border: '#bbf7d0' },
                                        'self-love': { bg: 'rgba(255, 251, 235, 0.9)', text: '#d97706', icon: '✨', border: '#fde68a' },
                                        'couples': { bg: 'rgba(255, 241, 242, 0.9)', text: '#be123c', icon: '💑', border: '#fda4af' },
                                        'bundle': { bg: 'rgba(236, 254, 255, 0.9)', text: '#0891b2', icon: '�', border: '#a5f3fc' },
                                      };
                                      
                                      const style = tagStyles[tag] || { bg: 'rgba(243, 244, 246, 0.9)', text: '#4b5563', icon: '🏷️', border: '#e5e7eb' };
                                      
                                      return (
                                        <span 
                                          key={idx} 
                                          className="px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border flex items-center gap-1"
                                          style={{ 
                                            background: style.bg, 
                                            color: style.text,
                                            borderColor: style.border 
                                          }}
                                        >
                                          <span>{style.icon}</span>
                                          <span className="uppercase tracking-tight">{tag.replace(/-/g, ' ')}</span>
                                        </span>
                                      );
                                    })}
                                    
                                    {/* Show Micro Benefit if slots available */}
                                    {product.microBenefits?.slice(0, Math.max(0, 3 - (product.tags?.length || 0))).map((benefit: string, idx: number) => (
                                      <span key={`mb-${idx}`} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-gray-700 shadow-sm border border-gray-100 whitespace-nowrap flex items-center gap-1">
                                        <span className="text-yellow-500">✨</span> {benefit}
                                      </span>
                                    ))}
                                  </div>
                                  {mediaElement}
                                </>
                              );
                            })()}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <CardContent className="p-3 md:p-6">
                            <h3 className="font-black text-gray-900 text-sm md:text-lg line-clamp-1">{product.name}</h3>
                            <p className="text-gray-500 text-xs md:text-sm font-medium line-clamp-1 mt-0.5 md:mt-1">{product.description}</p>
                            <div className="flex justify-between items-center mt-2 md:mt-4">
                              <span className="font-black text-base md:text-xl" style={{ color: primaryColor }}>
                                ₦{product.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                );
              })}
              {products.length === 0 && (
                <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem]">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <h3 className="text-xl font-black text-gray-400">No items in this location yet.</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Configurator Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-[2.5rem] border-0 shadow-3xl [&>button]:hidden">
          <div className="absolute top-4 right-4 z-50">
            <button 
              className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold shadow-lg hover:bg-white transition-all flex items-center gap-2 active:scale-95 text-sm"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <DialogHeader className="sr-only">
            <DialogTitle>Customize {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductConfigurator 
              product={selectedProduct} 
              onComplete={handleAddToCart}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Logistics T&C Modal */}
      <Dialog open={showLogisticsModal} onOpenChange={setShowLogisticsModal}>
        <DialogContent className="bg-white rounded-[2.5rem] border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black px-2">
              <Package className="w-6 h-6 text-indigo-600" /> Logistics Terms
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-6">
             <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded-full bg-indigo-100 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-indigo-600">1</div>
                   <p className="text-sm font-bold text-gray-700">No contraband, drugs, or illegal items.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded-full bg-indigo-100 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-indigo-600">2</div>
                   <p className="text-sm font-bold text-gray-700">Items must arrive 3 days before delivery date.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded-full bg-indigo-100 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-indigo-600">3</div>
                   <p className="text-sm font-bold text-gray-700">Perishables must be pre-arranged.</p>
                </div>
             </div>
             <Button 
                onClick={handleLogisticsAgree} 
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100"
              >
                I Agree (₦2,000 fee)
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FIXED BOTTOM BAR */}
      <div className="fixed bottom-4 md:bottom-6 left-0 right-0 z-50 pointer-events-none px-3 md:px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* VIEW CART BUTTON */}
          <Button 
            onClick={() => {
              sendEvent({ action: 'view_cart', category: 'Interaction', label: 'Floating Button' });
              setCartOpen(true);
            }}
            className="h-16 md:h-20 px-6 md:px-12 bg-gray-900 hover:bg-black text-white rounded-2xl md:rounded-[2rem] shadow-2xl flex items-center gap-3 md:gap-5 transition-all active:scale-95 group"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 md:-top-2 -right-1.5 md:-right-2 bg-rose-600 text-white text-[10px] md:text-xs font-black min-w-[20px] md:min-w-[24px] h-[20px] md:h-[24px] rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900 animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Total: ₦{totalAmount.toLocaleString()}</div>
              <div className="text-lg md:text-2xl font-black leading-none flex items-center gap-2">
                View Cart <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Button>
        </div>
      </div>

      <CartDrawer 
        open={cartOpen} 
        onOpenChange={setCartOpen} 
        city={city} 
        defaultView={cartView}
      />
    </div>
  );
}


