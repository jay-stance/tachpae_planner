'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ShieldCheck, Truck, MessageSquare, ArrowRight, Loader2, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEvent } from '@/context/EventContext';
import { cn } from '@/lib/utils';
import { trackInitiateCheckout, trackPurchase, trackContact } from '@/lib/metaPixel';

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
  city: { name: string };
}

export default function CheckoutForm({ onBack, onSuccess, city }: CheckoutFormProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { event } = useEvent();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    address: '',
    customMessage: ''
  });

  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* Service Fee Logic:
     0 - 50k: 2,500
     50k - 100k: 3,500
     ... +1000 for every 50k
  */
  const calculateServiceFee = (subtotal: number) => {
    if (subtotal <= 0) return 0;
    const brackets = Math.floor((subtotal - 1) / 50000);
    return 2500 + (brackets * 1000);
  };

  const serviceFee = calculateServiceFee(totalAmount); 
  const finalTotal = totalAmount + serviceFee;
  const [showFeeInfo, setShowFeeInfo] = useState(false);

  // Track InitiateCheckout when user views checkout form
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        value: finalTotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        productIds: items.map(item => item.productId),
      });
    }
  }, []); // Only track once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Order in DB
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event?._id,
          customer: {
            ...formData,
            whatsapp: formData.phone, // Map phone to whatsapp as per UI label
            city: city.name
          },
          items: items.map(item => ({
            type: item.type || 'PRODUCT', // Use type from cart, default to PRODUCT for legacy items
            referenceId: item.productId,
            name: item.productName,
            quantity: item.quantity,
            priceAtPurchase: item.basePrice,
            variantSelection: item.variantSelection,
            customizationData: item.customizationData
          })),
          totalAmount: finalTotal // Send final total including fee
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // 2. Format WhatsApp Message
      const orderId = result.order?.orderId || 'PENDING';
      let message = `*NEW ORDER - ${orderId}*\n\n`;
      message += `*Customer Details:*\n`;
      message += `- Name: ${formData.name}\n`;
      message += `- Phone (WhatsApp): ${formData.phone}\n`;
      if (formData.secondaryPhone) message += `- Alt Phone: ${formData.secondaryPhone}\n`;
      message += `- Address: ${formData.address}, ${city.name}\n`;
      if (formData.customMessage) message += `- Message: ${formData.customMessage}\n`;
      
      message += `\n*Order Items:*\n`;
      items.forEach(item => {
        message += `- ${item.productName} (x${item.quantity}) - ₦${item.totalPrice.toLocaleString()}\n`;
        // Format Variants

        if (item.variantSelection) {
          Object.values(item.variantSelection).forEach((variant: any) => {
             if (variant?.label) {
                message += `  • ${variant.label}\n`;
             }
          });
        }
        
        // Format Customization
        if (item.customizationData && Object.keys(item.customizationData).length > 0) {
           Object.entries(item.customizationData).forEach(([key, value]) => {
              message += `  • ${key}: ${value}\n`;
           });
        }
      });
      
      message += `\n*Subtotal: ₦${totalAmount.toLocaleString()}*\n`;
      message += `*Service Fee: ₦${serviceFee.toLocaleString()}*\n`;
      message += `*TOTAL AMOUNT: ₦${finalTotal.toLocaleString()}*\n\n`;
      message += `_This order was placed on Tachpae Planner._`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/+2347070295596?text=${encodedMessage}`;

      // 3. Track Purchase Event
      trackPurchase({
        orderId: orderId,
        value: finalTotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        productIds: items.map(item => item.productId),
      });
      
      // Track Contact for WhatsApp redirect
      trackContact('whatsapp');

      // 4. Redirect to WhatsApp FIRST (before clearing cart to avoid race condition with empty-cart redirect)
      // Use location.href instead of window.open to avoid popup blockers
      window.location.href = whatsappUrl;
      
      // 5. Clear Cart - This runs but user is already navigating away
      // If somehow the redirect fails, cart will be cleared anyway
      clearCart();
      onSuccess();
      
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Timer state for cart reservation
  const [timeLeft, setTimeLeft] = useState(600);
  
  useEffect(() => {
    const storedTimestamp = sessionStorage.getItem("tachpae_checkout_timestamp");
    let remaining = 600;
    
    if (storedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(storedTimestamp)) / 1000);
        remaining = 600 - elapsed;
    }
    
    // If timer expired or no timestamp, reset to fresh 10 minutes
    if (remaining <= 0 || !storedTimestamp) {
        sessionStorage.setItem("tachpae_checkout_timestamp", Date.now().toString());
        remaining = 600;
    }
    
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Trust + Timer Header */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-3 rounded-lg border border-rose-100 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="text-xs text-rose-700">
              <span className="font-semibold">Secure & Verified</span> <span className="hidden sm:inline">– Trusted by 10,000+</span>
            </p>
          </div>
          {timeLeft > 0 && (
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-amber-200 text-amber-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium">Reserved for</span>
              <span className="text-xs font-bold tabular-nums">{formattedTime}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-3">
        {/* Form Fields - Tighter spacing */}
        <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="h-10" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone (WhatsApp)</Label>
                <Input id="phone" name="phone" required placeholder="080..." value={formData.phone} onChange={handleInputChange} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="secondaryPhone" className="text-xs">Alt. Phone <span className="text-gray-400">(Optional)</span></Label>
                <Input id="secondaryPhone" name="secondaryPhone" placeholder="080..." value={formData.secondaryPhone} onChange={handleInputChange} className="h-10" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">Delivery Address (within {city.name})</Label>
              <Textarea className='placeholder:text-opacity-10 min-h-[60px]' id="address" name="address" required placeholder="No 12, Example Street..." value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="customMessage" className="text-xs">Special Requests <span className="text-gray-400">(Optional)</span></Label>
              <Textarea className='placeholder:text-opacity-10 min-h-[50px]' id="customMessage" name="customMessage" placeholder="Any special instructions?" value={formData.customMessage} onChange={handleInputChange} />
            </div>
        </div>

        {/* Compact Inline Bonuses */}
        <div className="flex flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Free Proposal Guide</span>
                <span className="text-slate-400 line-through">₦7.5k</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px]">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span className="text-purple-700 font-medium">Priority Support</span>
                <span className="text-slate-400 line-through">₦5k</span>
            </div>
        </div>

        {/* Pricing Summary - Compact */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span>₦{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => setShowFeeInfo(!showFeeInfo)}>
                  <span>Service Fee</span>
                  <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px] font-serif italic text-gray-500">i</div>
              </div>
              <span>₦{serviceFee.toLocaleString()}</span>
          </div>
          
          {showFeeInfo && (
              <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg leading-relaxed animate-in fade-in zoom-in-95">
                  Small fee for handling, logistics, and coordination.
              </div>
          )}

          <div className="flex items-center justify-between text-base font-bold pt-1.5 border-t border-dashed">
              <span className="text-gray-900">Total</span>
              <span className="text-rose-600">₦{finalTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Savings Banner + CTA */}
        <div className="space-y-3 pt-2">
            <div className="bg-emerald-50 p-2 text-center rounded-lg border border-dashed border-emerald-200">
                <p className="text-[10px] text-emerald-700 flex items-center justify-center gap-1 font-medium">
                    <Tag className="w-3 h-3" />
                    You're saving <span className="font-black text-emerald-600">₦12,500</span> on this order!
                </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Complete Order & Pay <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
        </div>
      </form>
    </div>
  );
}
