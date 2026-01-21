'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ShoppingBag, Gift, Calendar, Heart, Share2, Package, CheckCircle, Sparkles, ArrowRight, Copy, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';

interface PlannerDashboardProps {
  data: {
    city: any;
    categories: any[];
    products: any[];
    services: any[];
    addons?: any[];
    allCities?: any[];
  }
}

export default function PlannerDashboard({ data }: PlannerDashboardProps) {
  const router = useRouter();
  const { city, categories, products, services, addons = [] } = data;
  const { itemCount, addItem, getShareableLink } = useCart();
  const { event } = useEvent();
  
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [logisticsAgreed, setLogisticsAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(categories[0] || null);

  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';

  const getProductsByCategory = (catId: string) => products.filter((p: any) => 
    (p.category?._id || p.category) === catId
  );

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (config: any) => {
    if (!selectedProduct) return;
    
    addItem({
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      productImage: selectedProduct.mediaGallery?.[0],
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

  const filteredProducts = activeCategory?._id === 'specials' ? [] : getProductsByCategory(activeCategory?._id);

  return (
    <div className="w-full min-h-screen bg-white pb-32">
      <Header className="border-b border-gray-100" variant="light" />
      <div className="container mx-auto px-4 py-4 md:py-12">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-rose-50 rounded-full border border-rose-100 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Location</span>
                <select 
                  value={city.slug}
                  onChange={(e) => router.push(`/planning/${e.target.value}`)}
                  className="text-xs font-bold text-rose-600 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value={city.slug}>{city.name}</option>
                  {data.allCities?.map((c: any) => c.slug !== city.slug && (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">Curate Your Package</h1>
            <p className="text-gray-500 text-lg max-w-xl font-medium">Select gifts, experiences, and more for your Valentine.</p>
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

        {/* Categories Tabs */}
        <div className="mb-12 sticky top-4 z-40 bg-white/80 backdrop-blur-xl p-1.5 rounded-3xl border-2 border-gray-50 shadow-xl shadow-gray-100/50 flex flex-nowrap gap-1 md:gap-2 w-fit max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory({ _id: 'gifts', name: 'Gifts' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                (activeCategory?._id === 'gifts' || !['experiences', 'specials'].includes(activeCategory?._id))
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Gifts
            </button>
            <button
              onClick={() => setActiveCategory({ _id: 'experiences', name: 'Experiences' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                activeCategory?._id === 'experiences'
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Experiences
            </button>
            <button
              onClick={() => setActiveCategory({ _id: 'specials', name: 'Specials' } as any)}
              className={cn(
                "px-3 md:px-6 py-2 md:py-3 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 flex items-center whitespace-nowrap",
                activeCategory?._id === 'specials'
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Specials
            </button>
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeCategory?._id === 'specials' ? (
            <div className="space-y-24 pb-8">
              {/* SURPRISE YOURSELF - ELEGANT GIFTING EDIT */}
              <section className="relative overflow-hidden rounded-[2rem] bg-rose-50/50 border border-rose-100/50">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-0">
                  <div className="p-8 md:p-12 order-2 md:order-1 flex flex-col items-start space-y-4 relative z-50">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-rose-100 shadow-sm">
                        <Sparkles className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">The Mystery Edit</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-serif text-gray-900 leading-tight">
                      Surprise <span className="italic text-rose-500">Yourself.</span>
                    </h2>
                    
                    <p className="text-gray-600 text-sm md:text-lg max-w-sm leading-relaxed">
                      You don't need a partner to feel butterflies. You deserve a gift too. Let us curate a mystery box of joy, tailored just for you.
                    </p>

                    <Button 
                      asChild
                      className="mt-2 h-12 px-8 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <Link href={`/surprise?city=${city?.slug || 'abuja'}`}>
                        Get My Gift <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="relative h-64 md:h-full min-h-[300px] order-1 md:order-2 flex items-center justify-center bg-gradient-to-br from-red-100/20 to-transparent">
                     {/* Elegant Bouncing Box Animation */}
                     <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            filter: [
                                "drop-shadow(0 0 25px rgba(220, 38, 38, 0.3))", 
                                "drop-shadow(0 0 45px rgba(220, 38, 38, 0.5))", 
                                "drop-shadow(0 0 25px rgba(220, 38, 38, 0.3))"
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
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl -z-10 rounded-full animate-pulse" />
                     </motion.div>
                     
                     {/* Floor Shadow */}
                     <motion.div 
                        animate={{ scale: [1, 0.8, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 w-40 h-8 bg-red-900/20 blur-xl rounded-full -z-10"
                     />
                  </div>
                </div>
              </section>

              {/* OTHER SPECIALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Be My Val */}
                 <div className="space-y-6">
                    <div className="relative aspect-video overflow-hidden rounded-[2rem] shadow-xl">
                      <Image 
                        src="https://images.unsplash.com/photo-1522673607200-164483ee01c1?auto=format&fit=crop&q=80"
                        alt="Proposal"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-gray-900">Be My Val?</h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Planning for someone special? Create a digital proposal that builds anticipation and makes the big question unforgettable.
                      </p>
                      <Button 
                        variant="link"
                        asChild
                        className="text-rose-600 font-black p-0 h-auto text-lg underline-offset-4"
                      >
                        <Link href="/proposal/create">
                          Create Proposal Link <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                 </div>

                 {/* Logistics */}
                 <div className="space-y-6">
                    <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center">
                      <Package className="w-24 h-24 text-indigo-200" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-gray-900">Personal Courier.</h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Got a special something already? We'll pick it up, wrap it with love, and deliver it alongside your curated bundle.
                      </p>
                      <Button 
                        variant="link"
                        onClick={() => setShowLogisticsModal(true)}
                        className="text-indigo-600 font-black p-0 h-auto text-lg underline-offset-4"
                      >
                        Set up Logistics <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                 </div>
              </div>
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
            <div className="space-y-16 pb-12">
              {categories.map((cat: any) => {
                const catProducts = getProductsByCategory(cat._id);
                if (catProducts.length === 0) return null;
                return (
                  <section key={cat._id} className="space-y-8">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                      <span className="text-4xl">{cat.icon || '🎁'}</span>
                      {cat.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {catProducts.map((product: any) => (
                        <Card 
                          key={product._id} 
                          className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg shadow-gray-100 bg-white overflow-hidden rounded-[2rem]" 
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="aspect-square relative overflow-hidden bg-gray-50">
                            {product.mediaGallery?.[0] ? (
                              <Image 
                                src={product.mediaGallery[0]} 
                                alt={product.name} 
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">🎁</div>
                            )}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-black text-gray-900 text-lg line-clamp-1">{product.name}</h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-1 mt-1">{product.description}</p>
                            <div className="flex justify-between items-center mt-4">
                              <span className="font-black text-xl" style={{ color: primaryColor }}>
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-[2.5rem] border-0 shadow-3xl">
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
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* VIEW CART BUTTON */}
          <Button 
            onClick={() => setCartOpen(true)}
            className="h-16 px-10 bg-gray-900 hover:bg-black text-white rounded-3xl shadow-3xl flex items-center gap-4 transition-all active:scale-95 group"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900 animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">View Cart</div>
              <div className="text-lg font-black leading-none">Your Bundle</div>
            </div>
          </Button>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} city={city} />
    </div>
  );
}
