"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Star } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    number: "200+",
    label: "Vêtements analysés ce mois-ci",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: DollarSign,
    number: "26 700 €",
    label: "Économies totales détectées",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Star,
    number: "4.9/5",
    label: "Note moyenne des utilisateurs",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

export function StatsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full py-12 px-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl border border-gray-200 shadow-inner"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8"
        >
          Preuve sociale
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
                  stat.bgColor
                )}>
                  <Icon className={cn("w-8 h-8", stat.color)} strokeWidth={2.5} />
                </div>

                {/* Number */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                  className={cn(
                    "text-5xl md:text-6xl font-extrabold mb-2",
                    stat.color
                  )}
                >
                  {stat.number}
                </motion.div>

                {/* Label */}
                <p className="text-gray-600 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}








