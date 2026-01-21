import React, { Suspense } from 'react';
import { CartProvider } from '@/context/CartContext';
import { getCityBySlug } from '@/actions/city';
import SurpriseFlow from '@/components/surprise/SurpriseFlow';

async function SurpriseContent({ citySlug }: { citySlug: string | null }) {
  console.log('SurpriseContent rendering for citySlug:', citySlug);
  const city = citySlug ? await getCityBySlug(citySlug) : null;
  console.log('City found:', city?.name);
  
  return (
    <CartProvider cityId={city?._id?.toString()}>
      <SurpriseFlow />
    </CartProvider>
  );
}

export default async function SurprisePage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const resolvedParams = await searchParams;
  const citySlug = resolvedParams.city || null;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-rose-600 animate-pulse text-2xl">Loading the Magic...</div>}>
      <SurpriseContent citySlug={citySlug} />
    </Suspense>
  );
}
