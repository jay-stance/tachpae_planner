'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trackAddToCart } from '@/lib/metaPixel';

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  basePrice: number;
  quantity: number;
  variantSelection: Record<string, any>;
  customizationData: Record<string, any>;
  totalPrice: number;
  type: 'PRODUCT' | 'SERVICE' | 'ADDON' | 'BUNDLE';
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'totalPrice'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getShareableLink: () => string;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY_BASE = 'tachpae_cart';

export function CartProvider({ children, cityId }: { children: React.ReactNode, cityId?: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = cityId ? `${CART_STORAGE_KEY_BASE}_${cityId}` : CART_STORAGE_KEY_BASE;

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, isHydrated, storageKey]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const addItem = useCallback((item: Omit<CartItem, 'totalPrice'>) => {
    const totalPrice = item.basePrice * item.quantity;
    const itemType = item.type || 'PRODUCT';
    const newItem: CartItem = { ...item, totalPrice, type: itemType };
    
    // Track AddToCart event for Meta Pixel
    trackAddToCart({
      id: item.productId,
      name: item.productName,
      price: item.basePrice,
      quantity: item.quantity,
    });
    
    setItems(prev => {
      // Check if product already exists (by productId)
      const existingIndex = prev.findIndex(i => i.productId === item.productId);
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = { ...newItem, quantity: prev[existingIndex].quantity + item.quantity, totalPrice: prev[existingIndex].totalPrice + totalPrice };
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.productId === productId 
        ? { ...i, quantity, totalPrice: i.basePrice * quantity }
        : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getShareableLink = useCallback(() => {
    const encoded = btoa(JSON.stringify(items.map(i => ({ id: i.productId, q: i.quantity }))));
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist?items=${encoded}`;
  }, [items]);

  return (
    <CartContext.Provider value={{ 
      items, 
      itemCount, 
      totalAmount, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      getShareableLink,
      isHydrated
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
