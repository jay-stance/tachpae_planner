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
    whatsapp: '',
    secondaryPhone: '',
    address: '',
    customMessage: ''
  });

  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
            city: city.name
          },
          items: items.map(item => ({
            type: 'PRODUCT', // Support services later if needed
            referenceId: item.productId,
            name: item.productName,
            quantity: item.quantity,
            priceAtPurchase: item.basePrice,
            variantSelection: item.variantSelection,
            customizationData: item.customizationData
          })),
          totalAmount
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // 2. Format WhatsApp Message
      const orderId = result.order?.orderId || 'PENDING';
      let message = `*NEW ORDER - ${orderId}*\n\n`;
      message += `*Customer Details:*\n`;
      message += `- Name: ${formData.name}\n`;
      message += `- Phone: ${formData.phone}\n`;
      message += `- WhatsApp: ${formData.whatsapp}\n`;
      message += `- Address: ${formData.address}, ${city.name}\n`;
      if (formData.customMessage) message += `- Message: ${formData.customMessage}\n`;
      
      message += `\n*Order Items:*\n`;
      items.forEach(item => {
        message += `- ${item.productName} (x${item.quantity}) - ₦${item.totalPrice.toLocaleString()}\n`;
        if (Object.keys(item.variantSelection).length > 0) {
          message += `  _Variants: ${JSON.stringify(item.variantSelection)}_\n`;
        }
      });
      
      message += `\n*Total Amount: ₦${totalAmount.toLocaleString()}*\n\n`;
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

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 pb-20">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required placeholder="080..." value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" name="whatsapp" required placeholder="080..." value={formData.whatsapp} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" required placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="secondaryPhone">Alternative Phone (Optional)</Label>
              <Input id="secondaryPhone" name="secondaryPhone" placeholder="080..." value={formData.secondaryPhone} onChange={handleInputChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery Address (within {city.name})</Label>
              <Textarea id="address" name="address" required placeholder="No 12, Example Street..." value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customMessage">Special Instructions / Custom Message</Label>
              <Textarea id="customMessage" name="customMessage" placeholder="Any special requests?" value={formData.customMessage} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Order Total</span>
            <span className="text-xl font-bold text-rose-600">₦{totalAmount.toLocaleString()}</span>
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
