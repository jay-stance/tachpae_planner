'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import ConversionModal from './ConversionModal';

interface UpsellProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  addedProductName: string;
  recommendations: UpsellProduct[];
  onAddProduct: (product: UpsellProduct) => void;
  addedProductIds: string[];
}

/**
 * Upsell Modal
 * Shown: After first item added to cart
 * Purpose: Increase AOV with complementary suggestions
 */
export default function UpsellModal({
  isOpen,
  onClose,
  onDismiss,
  addedProductName,
  recommendations,
  onAddProduct,
  addedProductIds,
}: UpsellModalProps) {
  return (
    <ConversionModal isOpen={isOpen} onClose={onClose} onDismiss={onDismiss}>
      <div className="space-y-5 pt-2">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-3">
            <Check className="w-3.5 h-3.5" />
            Added to cart!
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Great choice! 💯
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            People who bought <span className="font-bold text-gray-700">{addedProductName}</span> also added these:
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((product) => {
            const isAdded = addedProductIds.includes(product.id);
            
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                {/* Product Image */}
                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{product.name}</h4>
                  <p className="text-rose-600 font-black text-base">₦{product.price.toLocaleString()}</p>
                </div>

                {/* Add Button */}
                <Button
                  size="sm"
                  variant={isAdded ? "secondary" : "default"}
                  onClick={() => !isAdded && onAddProduct(product)}
                  disabled={isAdded}
                  className={`rounded-full px-4 font-bold ${
                    isAdded 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : 'bg-gray-900 hover:bg-rose-600'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 mr-1" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
          <Sparkles className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose-700">
            <span className="font-bold">Pro tip:</span> Bundles make the best gifts — adding more items creates a fuller experience!
          </p>
        </div>

        {/* Continue Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-gray-500 font-bold hover:bg-gray-50"
        >
          No thanks, continue shopping
        </Button>
      </div>
    </ConversionModal>
  );
}
