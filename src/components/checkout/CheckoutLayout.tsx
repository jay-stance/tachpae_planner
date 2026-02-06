import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Distraction-Free Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/apple-icon.png" 
              alt="Tachpae" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="font-bold text-lg tracking-tight text-slate-900">Tachpae</span>
          </Link>

          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-8 text-center bg-white">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Tachpae Planner. Securely processing payments.
        </p>
      </footer>
    </div>
  );
}
