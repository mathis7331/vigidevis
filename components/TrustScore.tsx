"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrustScoreProps {
  score: number;
}

export function TrustScore({ score }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-emerald-600";
    if (score >= 50) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Prix Juste ✓";
    if (score >= 50) return "À Négocier";
    return "Arnaque Détectée !";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative w-48 h-48"
      >
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-200" />

        {/* Animated score circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={cn(
            "absolute inset-2 rounded-full flex items-center justify-center",
            "bg-gradient-to-br shadow-lg",
            getScoreBg(score)
          )}
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-5xl font-bold text-white"
            >
              {score}
            </motion.div>
            <div className="text-white/90 font-medium">/ 100</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={cn("text-2xl font-bold", getScoreColor(score))}
      >
        {getScoreLabel(score)}
      </motion.div>
    </div>
  );
}





