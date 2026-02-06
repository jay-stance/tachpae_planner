"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { motion } from "framer-motion";

export function UrgencyTimer() {
  // Initialize with 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    // Check if there's a stored timer in sessionStorage to persist across refreshes
    const storedTime = sessionStorage.getItem("tachpae_checkout_timer");
    const storedTimestamp = sessionStorage.getItem("tachpae_checkout_timestamp");

    if (storedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(storedTimestamp)) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setTimeLeft(remaining);
    } else {
        sessionStorage.setItem("tachpae_checkout_timestamp", Date.now().toString());
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (timeLeft === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 bg-rose-50/80 text-rose-700 px-4 py-2 rounded-lg border border-rose-100 text-sm font-medium mb-6"
    >
      <Timer className="w-4 h-4 animate-pulse" />
      <span>
        Your items are reserved for <span className="font-bold tabular-nums">{formattedTime}</span> minutes
      </span>
    </motion.div>
  );
}
