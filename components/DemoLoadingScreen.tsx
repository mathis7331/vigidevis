"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";

interface DemoLoadingScreenProps {
  onComplete: () => void;
}

const loadingMessages = [
  "Analyse de la photo...",
  "Identification de la marque...",
  "Recherche des prix similaires sur Vinted...",
  "Génération de l'annonce optimisée...",
];

export function DemoLoadingScreen({ onComplete }: DemoLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Bloquer le scroll du body pendant le chargement
    document.body.style.overflow = "hidden";
    
    // Animation de la barre de progression jusqu'à 100% en 3 secondes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Attendre 300ms avant d'appeler onComplete
          setTimeout(() => {
            document.body.style.overflow = "";
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 3.33; // ~100% en 3 secondes (100ms * 30 = 3000ms)
      });
    }, 100);

    // Changer le message toutes les 750ms
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 750);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
        >
          {/* Icon animation */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <Search className="w-10 h-10 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white text-center">
              IA en action
            </h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-orange-400" strokeWidth={2.5} fill="currentColor" />
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-lg"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-white/60">Analyse en cours</span>
              <span className="text-sm font-bold text-emerald-400">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Dynamic status message */}
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/90 font-medium text-base">
              {loadingMessages[messageIndex]}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

