import { ShieldCheck, Lock, Award, HeartHandshake } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Lock,
      title: "SSL Secure",
      desc: "256-bit Encrypted Payment",
    },
    {
      icon: ShieldCheck,
      title: "Privacy Protected",
      desc: "We never share your data",
    },
    {
      icon: HeartHandshake,
      title: "Satisfaction Guarantee",
      desc: "Re-planning support included",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-slate-100 mt-6">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-slate-50 rounded-full text-slate-600">
            <badge.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{badge.title}</h4>
            <p className="text-[10px] text-slate-500">{badge.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
