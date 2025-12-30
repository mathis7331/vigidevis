"use client";

import { motion } from "framer-motion";
import { Stethoscope, Home, Car, Zap, Wrench, TrendingDown } from "lucide-react";

const savings = [
  { text: "Julie a économisé 230€ sur un devis Dentiste", icon: Stethoscope, color: "text-blue-400" },
  { text: "Marc a évité une arnaque de 450€ sur sa Pompe à chaleur", icon: Home, color: "text-orange-400" },
  { text: "Sophie a réduit sa facture garage de 30%", icon: Car, color: "text-purple-400" },
  { text: "Thomas a économisé 180€ sur un devis Électricien", icon: Zap, color: "text-yellow-400" },
  { text: "Marie a détecté 320€ de surfacturation Plomberie", icon: Wrench, color: "text-red-400" },
  { text: "Marie a vendu son vintage 3x plus cher grâce à VINTED-TURBO", icon: TrendingDown, color: "text-primary" },
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





