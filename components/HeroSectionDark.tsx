"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PortalScene } from "@/components/PortalScene";

/**
 * HeroSectionDark - Design Awwwards-level sombre, luxueux et cinématographique
 * Fond noir profond (#050505) avec effet de lumière orange/dorée au sol
 * Navigation glassmorphism, typographie Playfair Display + Inter
 */
export function HeroSectionDark() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden">
      {/* Effet de lumière au sol (Orange/Doré) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-gradient-to-t from-orange-500/20 via-orange-500/10 to-transparent blur-3xl opacity-50 pointer-events-none" />

      {/* Navigation Fixe */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 md:px-16 lg:px-24 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo à gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <span className="text-white text-xl font-medium tracking-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
              Imaginie
            </span>
          </motion.div>

          {/* Liens centrés */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden md:flex items-center gap-8 text-sm text-gray-400"
          >
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#about" className="hover:text-white transition-colors">À propos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          </motion.div>

          {/* Bouton Log in à droite (Glassmorphism) */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 hover:border-white/20 transition-all duration-300"
          >
            Log in
          </motion.button>
        </div>
      </nav>

      {/* Contenu Principal */}
      <div className="relative z-10 min-h-screen flex items-center px-8 md:px-16 lg:px-24 pt-20 pb-32">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Colonne Gauche : Typographie & CTAs */}
          <div className="space-y-8">
            {/* H1 Principal */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Au plus près de votre{" "}
              <span className="italic bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                imaginaire
              </span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Là où les idées naissent d'une étincelle et deviennent des expériences vivantes grâce à l'IA. 
              Nous transformons l'inexistant en inoubliable.
            </motion.p>

            {/* Boutons CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {/* Bouton Primaire (Pill Glass Lumineux) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-4 bg-white/10 backdrop-blur-md text-[#050505] border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                <span className="relative z-10 flex items-center gap-2">
                  Lancer l'odyssée
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              {/* Bouton Secondaire (Sombre Transparent) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent text-gray-300 border border-white/10 rounded-full font-medium text-lg hover:bg-white/5 hover:border-white/20 hover:text-white transition-all duration-300"
              >
                Découvrir le concept
              </motion.button>
            </motion.div>

            {/* Social Proof (Bas Gauche) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center gap-4 pt-8"
            >
              {/* Avatars superposés */}
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold relative"
                    style={{
                      boxShadow: `0 0 20px ${i === 0 ? 'rgba(139, 92, 246, 0.5)' : i === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                Adopté par <span className="text-gray-300 font-medium">+12 000 créateurs</span>
              </span>
            </motion.div>
          </div>

          {/* Colonne Droite : Visuel Portail 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="relative w-full h-[600px] lg:h-[700px] rounded-3xl overflow-hidden border border-white/5"
          >
            <PortalScene />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
