"use client";

import { useCart } from "@/context/CartContext";
import { Tag } from "lucide-react";
import Image from "next/image";

export function OrderSummary() {
  const { items } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Order Summary</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden relative shrink-0">
                  {/* Fallback image logic */}
                  {item.productImage ? (
                     <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">IMG</div>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-slate-700 truncate pr-2">{item.productName}</p>
                    <p className="text-sm font-semibold text-slate-900 shrink-0">
                         From ₦{item.totalPrice.toLocaleString()}
                    </p>
                </div>
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-slate-100 my-4" />
        
        {/* Total items count only, no full breakdown */}
        <div className="flex justify-between items-center text-sm text-slate-500 pb-2">
           <span>Total Items</span>
           <span className="font-bold text-slate-900">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>

      </div>
       <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Tag className="w-3 h-3" />
                You saved <span className="font-bold text-emerald-600">₦12,500</span> on this order!
            </p>
       </div>
    </div>
  );
}
