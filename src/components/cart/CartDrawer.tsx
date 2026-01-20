'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, itemCount, totalAmount, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white border-l shadow-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Bundle ({itemCount} items)
          </SheetTitle>
          <SheetDescription>
            Review and manage your selected items.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
              <p>Your bundle is empty</p>
              <p className="text-sm">Start adding items to curate your package!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                  <p className="text-primary font-bold mt-1">₦{item.totalPrice.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className=" pt-4 flex-col gap-3 bg-rose-50/50 py-6 mx-4 mb-6">
            <div className="flex justify-between w-full text-lg font-bold p-3 bg-white rounded-xl shadow-sm mb-2">
              <span>Total:</span>
              <span className="text-rose-600">₦{totalAmount.toLocaleString()}</span>
            </div>
            <Button className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 shadow-lg rounded-xl">
              Proceed to Checkout
            </Button>
            <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={clearCart}>
              Clear Bundle
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
