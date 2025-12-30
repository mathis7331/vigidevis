"use client";

import { motion } from "framer-motion";
import { Scan } from "lucide-react";

interface HeroButtonProps {
  onClick: () => void;
}

export function HeroButton({ onClick }: HeroButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg sm:text-xl shadow-lg transition-colors overflow-hidden group cursor-pointer touch-manipulation select-none"
      type="button"
      aria-label="Analyser un vêtement"
    >
      {/* Subtle shimmer effect */}
      <motion.div
        animate={{
          x: [-200, 400],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
        }}
        className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
      />

      {/* Button Content */}
      <div className="relative flex items-center gap-3 z-10">
        <Scan className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        <span>Analyser un vêtement (Gratuit)</span>
      </div>
    </motion.button>
  );
}





