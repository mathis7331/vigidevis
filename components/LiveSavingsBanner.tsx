"use client";

import { motion } from "framer-motion";
import { Shirt, ShoppingBag, Heart, Zap, Sparkles, TrendingDown } from "lucide-react";

const savings = [
  { text: "Sarah a vendu son sac Zara en 1h grâce à l'IA", icon: ShoppingBag, color: "text-primary" },
  { text: "Thomas a vendu ses Jordan 50€ plus cher que prévu", icon: Zap, color: "text-accent" },
  { text: "Léa a vidé son dressing pour 200€ en une semaine", icon: Shirt, color: "text-primary" },
  { text: "Alex a découvert que sa veste valait 80€ au lieu de 30€", icon: Heart, color: "text-accent" },
  { text: "Emma a vendu 15 articles vintage en 48h", icon: Sparkles, color: "text-primary" },
  { text: "Lucas a boosté ses ventes de 300% avec les hashtags IA", icon: TrendingDown, color: "text-accent" },
];

export function LiveSavingsBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-3 overflow-hidden relative">
      {/* Gradient Overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10" />

      {/* Scrolling Content */}
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Duplicate the array to create seamless loop */}
        {[...savings, ...savings, ...savings].map((saving, index) => {
          const Icon = saving.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-3 text-sm font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Icon className={`w-4 h-4 ${saving.color}`} strokeWidth={2} />
              <span className="text-gray-100">{saving.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}





