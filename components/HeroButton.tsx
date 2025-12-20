"use client";

import { motion } from "framer-motion";
import { Scan, Sparkles } from "lucide-react";

interface HeroButtonProps {
  onClick: () => void;
}

export function HeroButton({ onClick }: HeroButtonProps) {
  return (
    <div className="relative inline-block">
      {/* Animated Glow Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-60 pointer-events-none"
      />

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 10px 30px -10px rgba(59, 130, 246, 0.5)",
            "0 10px 40px -10px rgba(99, 102, 241, 0.7)",
            "0 10px 30px -10px rgba(59, 130, 246, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-2xl overflow-hidden group cursor-pointer touch-manipulation select-none"
        type="button"
        aria-label="Scanner mon devis"
      >
        {/* Shimmer Effect */}
        <motion.div
          animate={{
            x: [-200, 400],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
          className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
        />

        {/* Button Content */}
        <div className="relative flex items-center gap-3 z-10">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Scan className="w-6 h-6" strokeWidth={2.5} />
          </motion.div>
          <span>Scanner mon devis</span>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
          </motion.div>
        </div>
      </motion.button>

      {/* Pulse Rings */}
      <motion.div
        animate={{
          scale: [1, 1.5],
          opacity: [0.6, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute inset-0 rounded-2xl border-4 border-blue-500 pointer-events-none"
      />
    </div>
  );
}





