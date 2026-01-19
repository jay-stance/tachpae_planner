'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ProductConfigurator from '@/components/products/ProductConfigurator';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useEvent } from '@/context/EventContext';
import { ShoppingBag, Gift, Calendar, Heart, Share2, Package, CheckCircle, Sparkles, ArrowRight, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PlannerDashboardProps {
  data: {
    city: any;
    categories: any[];
    products: any[];
    services: any[];
    addons?: any[];
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

  const handleAddonClick = (addon: any) => {
    if (addon.type === 'LINK' && addon.config?.redirectUrl) {
      router.push(addon.config.redirectUrl);
    } else if (addon.type === 'LOGISTICS') {
      setShowLogisticsModal(true);
    } else if (addon.type === 'QUESTIONNAIRE') {
      router.push(`/surprise?eventId=${event?._id || ''}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Badge 
              className="mb-2 text-white border-0"
              style={{ backgroundColor: primaryColor }}
            >
              {city.name} Edition
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Curate Your Package</h1>
            <p className="text-muted-foreground mt-1">Select gifts, experiences, and more.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2 rounded-full border-2 hover:bg-gray-50"
              onClick={handleShareWishlist}
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share Wishlist'}
            </Button>
            <Button 
              className="gap-2 rounded-full shadow-lg"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="w-4 h-4" /> 
              View Bundle ({itemCount})
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="gifts" className="space-y-8">
          <TabsList className="bg-white shadow-sm p-1.5 rounded-full border overflow-x-auto w-full md:w-auto flex">
            <TabsTrigger value="gifts" className="rounded-full px-6 flex-1 md:flex-none data-[state=active]:shadow-sm">
              <Gift className="w-4 h-4 mr-2" /> Gifts
            </TabsTrigger>
            <TabsTrigger value="experiences" className="rounded-full px-6 flex-1 md:flex-none data-[state=active]:shadow-sm">
              <Calendar className="w-4 h-4 mr-2" /> Experiences
            </TabsTrigger>
            <TabsTrigger value="specials" className="rounded-full px-6 flex-1 md:flex-none data-[state=active]:shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" /> Specials
            </TabsTrigger>
          </TabsList>

          {/* GIFTS TAB */}
          <TabsContent value="gifts" className="space-y-12">
            {categories.map((cat) => {
              const catProducts = getProductsByCategory(cat._id);
              if (catProducts.length === 0) return null;

              return (
                <section key={cat._id}>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    <span className="text-2xl">{cat.icon || '🎁'}</span> {cat.name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {catProducts.map((product: any) => (
                      <Card 
                        key={product._id} 
                        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white overflow-hidden" 
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="aspect-square relative overflow-hidden bg-gray-100">
                          {product.mediaGallery?.[0] ? (
                            <Image 
                              src={product.mediaGallery[0]} 
                              alt={product.name} 
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🎁</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{product.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="font-bold text-lg" style={{ color: primaryColor }}>
                              ₦{product.basePrice.toLocaleString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                            >
                              Add +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
            {products.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p>No products available for this location yet.</p>
              </div>
            )}
          </TabsContent>

          {/* EXPERIENCES TAB */}
          <TabsContent value="experiences">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <Card key={service._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-rose-300" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                        ₦{service.basePrice.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {service.bookingType === 'DIRECT' ? 'Book Online' : 'External'}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {service.bookingType === 'DIRECT' ? (
                      <Button className="w-full rounded-full" style={{ backgroundColor: primaryColor }}>
                        Book Time Slot <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full rounded-full" asChild>
                        <a href={service.redirectUrl || '#'} target="_blank" rel="noopener noreferrer">
                          Visit Website <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            {services.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p>No experiences found for this location yet.</p>
              </div>
            )}
          </TabsContent>

          {/* SPECIALS TAB */}
          <TabsContent value="specials">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Surprise Yourself */}
              <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 fill-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Surprise Yourself</CardTitle>
                  <CardDescription className="text-white/80">
                    Treat yourself to a mystery box curated just for you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-white text-rose-600 hover:bg-white/90 rounded-full font-semibold"
                    onClick={() => router.push(`/surprise?eventId=${event?._id || ''}`)}
                  >
                    Start Questionnaire <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Be My Val */}
              <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 fill-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Be My Val Proposal</CardTitle>
                  <CardDescription className="text-white/80">
                    Send a romantic digital proposal link to your crush.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-white text-red-600 hover:bg-white/90 rounded-full font-semibold"
                    onClick={() => router.push('/proposal/create')}
                  >
                    Create Proposal Link <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Logistics */}
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Custom Logistics</CardTitle>
                  <CardDescription className="text-white/80">
                    Already bought a gift elsewhere? We will package it with your order!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-full font-semibold"
                    onClick={() => setShowLogisticsModal(true)}
                  >
                    Send Your Own Item <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Configurator Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl">
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
        <DialogContent className="bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" /> Custom Logistics - Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Please read carefully before proceeding.
            </DialogDescription>
          </DialogHeader>
          {!logisticsAgreed ? (
            <div className="space-y-4 pt-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                <li><strong>No Contraband:</strong> We do not accept illegal items, drugs, or weapons.</li>
                <li><strong>Perishables:</strong> No food items that expire within 48 hours unless pre-arranged.</li>
                <li><strong>Delivery Window:</strong> Items must arrive at our hub 3 days before the delivery date.</li>
                <li><strong>Packaging:</strong> Items should be reasonably packaged. We re-box them into the gift hamper.</li>
              </ul>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowLogisticsModal(false)}>Cancel</Button>
                <Button onClick={handleLogisticsAgree} style={{ backgroundColor: primaryColor }}>
                  I Agree (₦2,000 fee)
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center pt-4 space-y-4">
              <div className="flex flex-col items-center justify-center text-green-600 mb-4">
                <CheckCircle className="w-12 h-12 mb-2" />
                <span className="font-bold text-lg">Added to Bundle!</span>
              </div>
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm font-bold text-foreground mb-1">Hub Address for {city.name}:</p>
                <p className="text-sm text-muted-foreground">
                  Tachpae Hub, 123 Valentine Avenue, <br/>
                  Near {city.name} City Mall, <br/>
                  {city.name} State.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                A handling fee of ₦2,000 has been added to your bundle.
                Please drop off the item with your Order ID written on it.
              </p>
              <DialogFooter>
                <Button onClick={() => setShowLogisticsModal(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
