import React, { Suspense } from 'react';
import { getProductsByIds } from '@/actions/planner';
import WishlistDisplay from '@/components/wishlist/WishlistDisplay';
import { CartProvider } from '@/context/CartContext';

async function WishlistContent({ encodedItems }: { encodedItems: string }) {
  let decodedItems: { id: string; q: number }[] = [];
  try {
    decodedItems = JSON.parse(Buffer.from(encodedItems, 'base64').toString('utf-8'));
  } catch (e) {
    console.error('Failed to decode wishlist items:', e);
  }

  const ids = decodedItems.map(item => item.id);
  const products = await getProductsByIds(ids);

  return (
    <CartProvider>
      <WishlistDisplay products={products} items={decodedItems} />
    </CartProvider>
  );
}

export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const resolvedParams = await searchParams;
  const encodedItems = resolvedParams.items;

  if (!encodedItems) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-rose-600 text-2xl">
        Invalid Bundle Link
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-rose-600 animate-pulse text-2xl">Unpacking the Magic...</div>}>
      <WishlistContent encodedItems={encodedItems} />
    </Suspense>
  );
}
