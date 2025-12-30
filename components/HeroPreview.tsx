"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";

export function HeroPreview() {
  const score = 65;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = "#f59e0b"; // orange

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto border-2 border-violet-200/50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1)',
      }}
    >
      {/* Header avec catégorie */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Car className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Catégorie</p>
          <p className="text-lg font-bold text-gray-900">Mécanique Auto</p>
        </div>
      </div>

      {/* Cercle de progression */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-48 h-48 mb-4">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            {/* Animated progress circle avec dégradé orange vif */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>

          {/* Score text in center avec dégradé */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-5xl font-black bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 bg-clip-text text-transparent"
            >
              {score}
            </motion.div>
            <div className="text-gray-500 font-medium text-sm">/100</div>
          </div>
        </div>

        {/* Label Score de Confiance */}
        <p className="text-sm text-gray-600 font-medium mb-3">
          Score de Confiance : {score}/100
        </p>
      </div>

      {/* Badge À NÉGOCIER avec animation pulsation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center mb-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="px-6 py-3 rounded-full font-black text-base bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-gray-900 shadow-xl border-2 border-orange-300"
        >
          ⚠️ À NÉGOCIER
        </motion.div>
      </motion.div>

      {/* Économie potentielle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600 font-medium mb-1">
          Économie potentielle :
        </p>
        <motion.p
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-4xl font-black text-red-600 drop-shadow-lg"
        >
          175€
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

