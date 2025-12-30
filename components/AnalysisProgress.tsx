"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Search, Calculator, CheckCircle } from "lucide-react";

const analysisSteps = [
  {
    icon: Search,
    message: "Analyse de la photo de ton vêtement...",
    duration: 1200, // 1.2 secondes
  },
  {
    icon: TrendingUp,
    message: "Identification de la marque et du style...",
    duration: 1500, // 1.5 secondes
  },
  {
    icon: Search,
    message: "Recherche des prix similaires sur Vinted...",
    duration: 1300, // 1.3 secondes
  },
  {
    icon: Calculator,
    message: "Génération de la description optimisée...",
    duration: 1200, // 1.2 secondes
  },
  {
    icon: Zap,
    message: "Création des hashtags tendance...",
    duration: 1400, // 1.4 secondes
  },
  {
    icon: CheckCircle,
    message: "Finalisation de ton annonce parfaite...",
    duration: 1000, // 1 seconde
  },
];

interface AnalysisProgressProps {
  onComplete?: () => void;
}

export function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Calculer la durée totale (somme de toutes les durées)
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    
    // Progress bar animation (synchronisée avec les étapes)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // 100% en totalDuration ms (toutes les 10ms)
        return prev + (100 / (totalDuration / 10));
      });
    }, 10);

    // Step messages cycling
    let stepTimeout: NodeJS.Timeout;
    let currentStepIndex = 0;

    const cycleSteps = () => {
      if (currentStepIndex < analysisSteps.length) {
        setCurrentStep(currentStepIndex);
        stepTimeout = setTimeout(() => {
          currentStepIndex++;
          cycleSteps();
        }, analysisSteps[currentStepIndex].duration);
      } else {
        onComplete?.();
      }
    };

    cycleSteps();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  const CurrentIcon = analysisSteps[currentStep]?.icon || Zap;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 backdrop-blur-xl flex items-center justify-center z-50 p-6">
      <div className="max-w-2xl w-full">
        {/* Main container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl"
        >
          {/* Icon animation */}
          <div className="flex justify-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <CurrentIcon className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              IA en action
            </h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Zap className="w-8 h-8 text-orange-400" strokeWidth={2.5} fill="currentColor" />
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
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white/90 font-medium text-lg">
                {analysisSteps[currentStep]?.message}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Particles animation */}
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


