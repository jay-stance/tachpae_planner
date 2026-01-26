'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ShieldCheck, Truck, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEvent } from '@/context/EventContext';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
  city: any;
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

      // 3. Clear Cart and Redirect
      clearCart();
      onSuccess();
      window.open(whatsappUrl, '_blank');
      
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Trust Header */}
      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-6">
        <div className="flex items-center gap-3 text-rose-700 font-bold text-sm mb-1">
          <ShieldCheck className="w-5 h-5" />
          Secure & Verified
        </div>
        <p className="text-xs text-rose-600/80">
          Trusted by over 10,000+ people. You will be redirected to WhatsApp to finalize your payment securely, and stay connected with us for enquiries and updates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 pb-64">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                <Input id="phone" name="phone" required placeholder="080..." value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secondaryPhone">Alternative Phone (Optional)</Label>
                <Input id="secondaryPhone" name="secondaryPhone" placeholder="080..." value={formData.secondaryPhone} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery Address (within {city.name})</Label>
              <Textarea className='placeholder:text-opacity-10' id="address" name="address" required placeholder="No 12, Example Street..." value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customMessage">Special Instructions / Custom Message</Label>
              <Textarea className='placeholder:text-opacity-10' id="customMessage" name="customMessage" placeholder="Any special requests?" value={formData.customMessage} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₦{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => setShowFeeInfo(!showFeeInfo)}>
                    <span>Service Fee</span>
                    <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-serif italic text-gray-500">i</div>
                </div>
                <span>₦{serviceFee.toLocaleString()}</span>
            </div>
            
            {showFeeInfo && (
                <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg leading-relaxed animate-in fade-in zoom-in-95">
                    To ensure a seamless experience, we charge a small service fee based on your order volume. This covers handling, logistics support, and dedicated coordination.
                </div>
            )}

            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-dashed">
                <span className="text-gray-900">Total</span>
                <span className="text-rose-600">₦{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="px-6 rounded-xl">
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Complete Order & Pay <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
