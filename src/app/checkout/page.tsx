"use client";

import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { TrustBadges } from "@/components/checkout/TrustBadges";
import { Testimonials } from "@/components/checkout/Testimonials";

import CheckoutForm from "@/components/cart/CheckoutForm"; // Reusing existing logic
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { CartProvider } from "@/context/CartContext";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityName = searchParams.get('cityName') || 'Lagos';
  const cityId = searchParams.get('cityId'); // Get cityId from URL
  
  const city = { name: cityName };

  // We wrap the internal content in access logic so we can check items AFTER provider init
  return (
    <CartProvider cityId={cityId || undefined}>
        <CheckoutInnerContent city={city} />
    </CartProvider>
  );
}

function CheckoutInnerContent({ city }: { city: { name: string } }) {
  const { items, isHydrated } = useCart();
  const router = useRouter();

  // Redirect if cart is empty, but ONLY after hydration
  useEffect(() => {
    if (isHydrated && items.length === 0) {
       router.push("/");
    }
  }, [items, isHydrated, router]);

  return (
    <CheckoutLayout>
      <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Finalize Your Plan</h1>
              <p className="text-sm text-slate-500 mt-1">Complete your details below to reserve your experience.</p>
            </div>
            
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200">
                <CheckoutForm 
                    city={city}
                    onSuccess={() => {
                        console.log("Checkout successful");
                    }}
                    onBack={() => router.push("/")}
                />
            </div>
            
            <Testimonials />
            <TrustBadges />
      </div>
    </CheckoutLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
