import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Distraction-Free Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* Simple Text Logo or Icon - avoiding full nav menu */}
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                T
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Tachpae</span>
          </Link>

          <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline">Secure Checkout</span>
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
