"use client";

import { motion } from "framer-motion";
import { Shirt, ShoppingBag } from "lucide-react";

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto border-2 border-primary/20 overflow-hidden"
      style={{
        boxShadow: '0 25px 50px -12px rgba(9, 177, 186, 0.25), 0 0 0 1px rgba(9, 177, 186, 0.1)',
      }}
    >
      {/* Mock Vinted Header */}
      <div className="bg-primary px-4 py-3 flex items-center gap-2 mb-4 rounded-t-2xl">
        <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
        <span className="text-white font-bold text-lg">Vinted</span>
      </div>

      {/* Product Image Placeholder */}
      <div className="aspect-square bg-secondary flex items-center justify-center mb-4 rounded-2xl relative overflow-hidden">
        <Shirt className="w-20 h-20 text-gray-400" strokeWidth={1.5} />
        <div className="absolute bottom-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
          Photo de ton vêtement
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-text mb-1">
            Sweat Nike Vintage 90s - Gris Chiné
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary">
              45,00 €
            </span>
            <span className="text-sm text-gray-500 line-through">
              60,00 €
            </span>
          </div>
        </div>

        {/* Badge Potentiel Viral */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
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
            className="px-4 py-2 rounded-full font-black text-sm bg-gradient-to-r from-accent via-accent/90 to-accent text-white shadow-xl"
          >
            Potentiel Viral 🔥
          </motion.div>
        </motion.div>

        {/* Condition Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
            État: 8/10
          </span>
          <span className="text-gray-500">•</span>
          <span>Taille: L</span>
        </div>
      </div>
    </motion.div>
  );
}

