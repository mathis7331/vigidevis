"use client";

import { motion } from "framer-motion";
import { Scan } from "lucide-react";

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-navy-900/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="inline-block mb-6"
        >
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Scan className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-bold text-white mb-2"
        >
          Analyse en cours...
        </motion.h2>

        <p className="text-emerald-300">
          Notre IA inspecte chaque ligne de votre devis
        </p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 rounded-full bg-emerald-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}





