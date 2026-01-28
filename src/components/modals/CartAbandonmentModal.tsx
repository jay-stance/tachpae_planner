'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import ConversionModal from './ConversionModal';

interface CartAbandonmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onCompleteOrder: () => void;
  onChatWhatsApp: () => void;
  itemCount: number;
  totalAmount: number;
  daysUntilValentine: number;
}

/**
 * Cart Abandonment Modal
 * Shown: When user closes cart drawer (45 sec after opening) OR on second visit if cart has items
 * Purpose: Re-engage hesitant buyers
 */
export default function CartAbandonmentModal({
  isOpen,
  onClose,
  onDismiss,
  onCompleteOrder,
  onChatWhatsApp,
  itemCount,
  totalAmount,
  daysUntilValentine,
}: CartAbandonmentModalProps) {
  return (
    <ConversionModal isOpen={isOpen} onClose={onClose} onDismiss={onDismiss}>
      <div className="text-center space-y-5 pt-2">
        {/* Icon with cart badge */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-rose-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-600 text-white font-black text-sm flex items-center justify-center border-2 border-white">
            {itemCount}
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            Hold on! 🤔 Your cart is still waiting
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Valentine's Day is around the corner — delivery slots are filling up fast. Don't miss out!
          </p>
        </div>

        {/* Cart Summary */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{itemCount} item{itemCount > 1 ? 's' : ''} in cart</span>
            <span className="font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
          </div>
          
          {/* Urgency indicator */}
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{daysUntilValentine} days until Valentine's Day</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button
            onClick={onCompleteOrder}
            className="w-full h-14 text-lg rounded-2xl bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-200"
          >
            Complete My Order <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onChatWhatsApp}
            className="w-full h-12 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:border-green-500 hover:text-green-600"
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            Have questions? Chat with us on WhatsApp
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-gray-400 font-bold"
          >
            I'll be back
          </Button>
        </div>
      </div>
    </ConversionModal>
  );
}
