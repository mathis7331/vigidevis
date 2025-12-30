"use client";

import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeroProps {
  onUploadClick?: () => void;
  onExampleClick?: () => void;
}

export function Hero({ onUploadClick, onExampleClick }: HeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
    } else {
      // Scroll vers la section upload
      const uploadSection = document.getElementById('upload');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExampleClick = () => {
    if (onExampleClick) {
      onExampleClick();
    } else {
      router.push('/demo');
    }
  };

  // Animation variants pour les lignes de texte
  const lineVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      clipPath: "inset(100% 0 0 0)"
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      clipPath: "inset(0% 0 0 0)",
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] // Custom easing pour effet premium
      }
    })
  };

  // Animation pour l'image flottante
  const floatingVariants = {
    float: {
      y: [-15, 15, -15],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background avec gradient radial et noise */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-[#020617]">
        {/* Noise overlay subtil */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navbar Glassmorphism */}
      <nav className="relative z-50 px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-xl tracking-wider">
              VINTED-TURBO
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="#how-it-works"
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              Comment ça marche
            </Link>
            <Link 
              href="#testimonials"
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              Témoignages
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-[#020617] rounded-full font-black text-sm tracking-tight hover:bg-white/90 transition-colors"
            >
              Booster mon dressing
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
          >
            <Link 
              href="#how-it-works"
              className="block py-2 text-white/80 hover:text-white transition-colors"
            >
              Comment ça marche
            </Link>
            <Link 
              href="#testimonials"
              className="block py-2 text-white/80 hover:text-white transition-colors"
            >
              Témoignages
            </Link>
            <button className="w-full mt-4 px-6 py-3 bg-white text-[#020617] rounded-full font-black text-sm">
              Booster mon dressing
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Content - Split Layout */}
      <div className="relative z-10 px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center min-h-[70vh]">
            
            {/* GAUCHE : Le Message */}
            <div className="relative z-20">
              <motion.div
                initial="hidden"
                animate="visible"
                className="space-y-0"
              >
                <motion.h1
                  custom={0}
                  variants={lineVariants}
                  className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]"
                >
                  VENDS TES
                </motion.h1>
                
                <motion.h1
                  custom={1}
                  variants={lineVariants}
                  className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]"
                >
                  SAPES EN
                </motion.h1>
                
                <motion.h1
                  custom={2}
                  variants={lineVariants}
                  className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent uppercase tracking-tighter leading-[0.85]"
                >
                  30 SECONDES
                </motion.h1>
              </motion.div>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-8 text-white/60 text-lg md:text-xl font-medium max-w-md leading-relaxed"
              >
                L'IA analyse ton vêtement, génère l'annonce Vinted parfaite et te dit combien ça vaut. Fini la galère.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mt-10"
              >
                <motion.button
                  onClick={handleUploadClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-full font-black text-base tracking-tight hover:bg-primary/90 transition-colors shadow-2xl shadow-primary/30"
                >
                  Analyser un vêtement (Gratuit)
                </motion.button>
                <motion.button
                  onClick={handleExampleClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full font-bold text-base tracking-tight hover:bg-white/20 transition-colors"
                >
                  Voir un exemple
                </motion.button>
              </motion.div>
            </div>

            {/* DROITE : L'Élément Flottant 3D */}
            <div className="relative z-10 md:z-0">
              <motion.div
                variants={floatingVariants}
                animate="float"
                className="relative"
              >
                {/* Container pour l'image avec effet 3D */}
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  {/* Glow effect derrière */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-3xl scale-110" />
                  
                  {/* Image placeholder - Tu peux remplacer par une vraie image */}
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm">
                    {/* Placeholder avec un mockup iPhone/Vinted ou image de vêtement */}
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Mockup iPhone avec interface Vinted */}
                      <div className="w-[280px] h-[560px] bg-white rounded-[3rem] p-2 shadow-2xl">
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2.5rem] flex flex-col items-center justify-center p-6">
                          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-white" strokeWidth={1.5} />
                          </div>
                          <div className="text-center">
                            <p className="text-[#020617] font-black text-xl mb-2">VINTED-TURBO</p>
                            <p className="text-[#020617]/60 text-sm">Ton annonce en 30s</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Particules flottantes pour effet premium */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary/40"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 12}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimaliste */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
          <div className="text-center md:text-left">
            Optimisé par IA pour Vinted™
          </div>
          <div className="text-center">
            Fait avec ❤️ par les étudiants de Mons
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium">
              FR
            </button>
            <span className="text-white/40">/</span>
            <button className="px-3 py-1 rounded-full hover:bg-white/10 transition-colors">
              EN
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

