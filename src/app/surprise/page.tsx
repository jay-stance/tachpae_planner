import React, { Suspense } from 'react';
import { CartProvider } from '@/context/CartContext';
import { getCityBySlug } from '@/actions/city';
import SurpriseFlow from '@/components/surprise/SurpriseFlow';

import Addon from '@/models/Addon';
import dbConnect from '@/lib/db';

async function getSurpriseAddon() {
  await dbConnect();
  const addon = await Addon.findOne({ slug: 'surprise-yourself', isActive: true });
  return addon ? addon.toObject() : null;
}

async function SurpriseContent({ citySlug }: { citySlug: string | null }) {
  console.log('SurpriseContent rendering for citySlug:', citySlug);
  const city = citySlug ? await getCityBySlug(citySlug) : null;
  const surpriseAddon = await getSurpriseAddon();
  
  // Use DB config or fallback if missing (though script should have fixed it)
  const questionnaireConfig = surpriseAddon?.config?.questionnaireSchema;

  return (
    <CartProvider cityId={city?._id?.toString()}>
      <SurpriseFlow config={questionnaireConfig} />
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
