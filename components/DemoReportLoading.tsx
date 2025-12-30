"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Calculator, Zap } from "lucide-react";

interface DemoReportLoadingProps {
  onComplete: () => void;
}

const loadingMessages = [
  { icon: Search, message: "Analyse de la photo...", duration: 800 },
  { icon: TrendingUp, message: "Recherche des prix Vinted...", duration: 800 },
  { icon: Calculator, message: "Génération de l'annonce...", duration: 800 },
];

export function DemoReportLoading({ onComplete }: DemoReportLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Animation de la barre de progression jusqu'à 100% en ~2.4 secondes (3 messages * 800ms)
    const totalDuration = loadingMessages.reduce((sum, msg) => sum + msg.duration, 0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + (100 / (totalDuration / 10)); // 100% en totalDuration ms
      });
    }, 10);

    // Messages qui défilent
    let stepTimeout: NodeJS.Timeout;
    let currentStepIndex = 0;

    const cycleSteps = () => {
      if (currentStepIndex < loadingMessages.length) {
        setCurrentStep(currentStepIndex);
        stepTimeout = setTimeout(() => {
          currentStepIndex++;
          cycleSteps();
        }, loadingMessages[currentStepIndex].duration);
      }
    };

    cycleSteps();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  const CurrentIcon = loadingMessages[currentStep]?.icon || Search;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 backdrop-blur-xl flex items-center justify-center z-50 p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
        >
          {/* Icon animation */}
          <div className="flex justify-center mb-6">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <CurrentIcon className="w-10 h-10 text-white" strokeWidth={2.5} />
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
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white/90 font-medium text-base">
                {loadingMessages[currentStep]?.message}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

