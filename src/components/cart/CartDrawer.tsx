import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import CheckoutForm from './CheckoutForm';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: any;
}

export default function CartDrawer({ open, onOpenChange, city }: CartDrawerProps) {
  const { items, itemCount, totalAmount, removeItem, updateQuantity, clearCart } = useCart();
  const [view, setView] = useState<'cart' | 'checkout'>('cart');

  // Reset view when drawer closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) setTimeout(() => setView('cart'), 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white border-l shadow-2xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="flex items-center gap-2">
              {view === 'checkout' ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setView('cart')} className="h-8 w-8 -ml-2">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  Checkout Details
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Your Bundle ({itemCount} items)
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {view === 'checkout' 
                ? 'Complete your order information below.' 
                : 'Review and manage your selected items.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {view === 'cart' ? (
              <>
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
                        <p className="text-rose-600 font-bold mt-1">₦{item.totalPrice.toLocaleString()}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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
              </>
            ) : (
              <CheckoutForm 
                city={city} 
                onBack={() => setView('cart')} 
                onSuccess={() => onOpenChange(false)} 
              />
            )}
          </div>

          {view === 'cart' && items.length > 0 && (
            <div className="p-6 bg-gray-50/50 border-t mt-auto">
              <div className="flex justify-between w-full text-lg font-bold p-4 bg-white rounded-xl shadow-sm border mb-4">
                <span className="text-gray-600">Total Bundle:</span>
                <span className="text-rose-600">₦{totalAmount.toLocaleString()}</span>
              </div>
              <Button 
                onClick={() => setView('checkout')}
                className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 rounded-xl font-bold"
              >
                Proceed to Checkout
              </Button>
              <Button variant="ghost" className="w-full text-sm text-gray-400 mt-2" onClick={clearCart}>
                Clear Bundle
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
