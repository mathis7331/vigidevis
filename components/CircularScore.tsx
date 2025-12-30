"use client";

import { motion } from "framer-motion";

interface CircularScoreProps {
  score: number;
}

export function CircularScore({ score }: CircularScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "#10b981"; // emerald
    if (score >= 50) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const getLabel = (score: number) => {
    if (score >= 80) return "EXCELLENT";
    if (score >= 50) return "À NÉGOCIER";
    return "ATTENTION";
  };

  const color = getColor(score);
  const label = getLabel(score);
  
  // SVG circle parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
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

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-5xl font-black"
            style={{ color }}
          >
            {score}
          </motion.div>
          <div className="text-gray-500 font-medium">/100</div>
        </div>
      </div>

      {/* Badge label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 px-4 py-2 rounded-full font-bold text-sm"
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {label}
      </motion.div>
    </div>
  );
}















