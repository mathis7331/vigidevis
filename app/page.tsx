"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Shirt, Sparkles, ShoppingBag, Heart, Camera, TrendingDown, Eye, Play, Lock, HelpCircle, CheckCircle2, Zap, RotateCcw, Trash2, Shield, ChevronDown, Menu, X, ArrowRight, Star, ScanLine, Timer, DollarSign } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { createPendingAnalysis } from "@/actions/create-pending-analysis";
import { compressImageIfNeeded } from "@/lib/image-compression";
import { toast } from "sonner";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging classes
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Components for the Bento Grid
function BentoCard({ children, className, ...props }: any) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-surface backdrop-blur-md",
        "hover:border-primary/30 hover:bg-surface/80 transition-all duration-300",
        "hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
      whileHover={{ y: -4 }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      {children}
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [timerValue, setTimerValue] = useState(0);

  // Spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll effects
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, -100]);
  const parallaxY = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Timer animation for Bento Grid
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerValue(prev => (prev + 1) % 31);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const scrollToUpload = () => {
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Format invalide', { description: 'Utilisez JPG ou PNG.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', { description: 'Maximum 10MB.' });
      return;
    }

    try {
      setIsAnalyzing(true);
      setShowProgress(false);
      toast.loading('Preparation de ton vetement...', { id: 'upload' });

      const reader = new FileReader();
      reader.onload = async () => {
        let base64 = reader.result as string;

        try {
          base64 = await compressImageIfNeeded(file);
        } catch (compressionError) {
          console.error('Compression error:', compressionError);
        }

        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

        try {
          const checkResponse = await fetch('/api/check-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          const checkData = await checkResponse.json();

          if (!checkData.success || !checkData.valid) {
            toast.error('Photo non reconnue', {
              id: 'upload',
              description: "Assure-toi que la photo montre bien un vetement."
            });
            setIsAnalyzing(false);
            return;
          }

          toast.loading('Sauvegarde en cours...', { id: 'upload' });
          const saveResult = await createPendingAnalysis(base64Data);

          if (saveResult.success && saveResult.id) {
            toast.success('Vetement pret !', { id: 'upload' });
            setShowProgress(false);
            setIsAnalyzing(false);
            router.push(`/rapport/${saveResult.id}`);
          } else {
            toast.error('Erreur', { id: 'upload', description: saveResult.error });
            setIsAnalyzing(false);
          }
        } catch (error) {
          toast.error('Erreur reseau', { id: 'upload' });
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erreur', { description: error instanceof Error ? error.message : 'Erreur inattendue' });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-secondary overflow-hidden">
      {/* Noise overlay for texture */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Spotlight effect */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(45, 212, 191, 0.03), transparent 40%)`,
        }}
      />

      {/* Loading overlay */}
      {showProgress && <AnalysisProgress />}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-text font-black text-xl tracking-wider">VINTED-TURBO</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text/80 hover:text-primary transition-colors font-medium">
                Fonctionnalites
              </a>
              <a href="#pricing" className="text-text/80 hover:text-primary transition-colors font-medium">
                Tarifs
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToUpload}
                className="px-6 py-3 bg-primary text-secondary rounded-full font-black text-sm tracking-tight hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
              >
                Booster mon dressing
              </motion.button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-text"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 p-4 bg-surface/90 backdrop-blur-xl rounded-2xl border border-white/10"
              >
                <a href="#features" className="block py-2 text-text/80 hover:text-primary transition-colors">
                  Fonctionnalites
                </a>
                <a href="#pricing" className="block py-2 text-text/80 hover:text-primary transition-colors">
                  Tarifs
                </a>
                <button
                  onClick={() => { setShowMobileMenu(false); scrollToUpload(); }}
                  className="w-full mt-4 px-6 py-3 bg-primary text-secondary rounded-full font-black text-sm"
                >
                  Booster mon dressing
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* HERO SECTION - Enhanced with Spotlight & Parallax */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          style={{ y: heroY }}
          className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Text */}
          <div className="relative z-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface backdrop-blur-xl border border-primary/30 text-primary font-semibold text-sm"
              >
                <Zap className="w-4 h-4" strokeWidth={2.5} />
                Intelligence Artificielle Avancee
              </motion.div>

              {/* Main Headline - Character by character animation */}
              <div className="space-y-2">
                {["VENDS TES", "SAPES EN", "30 SECONDES"].map((line, lineIndex) => (
                  <motion.div
                    key={lineIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + lineIndex * 0.1 }}
                    className="overflow-hidden"
                  >
                    <motion.h1
                      className={cn(
                        "text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85]",
                        lineIndex === 2 ? "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" : "text-text"
                      )}
                      initial={{ y: 100 }}
                      animate={{ y: 0 }}
                      transition={{
                        delay: 0.6 + lineIndex * 0.15,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      {line.split('').map((char, charIndex) => (
                        <motion.span
                          key={charIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.8 + lineIndex * 0.15 + charIndex * 0.03,
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                          className="inline-block"
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ))}
                    </motion.h1>
                  </motion.div>
                ))}
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-text/70 text-lg md:text-xl max-w-lg leading-relaxed"
              >
                L&apos;IA analyse ton vetement, genere l&apos;annonce parfaite et te dit combien ca vaut vraiment.
                <span className="text-primary font-semibold"> Fini la galere.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToUpload}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-secondary rounded-full font-black text-lg tracking-tight hover:shadow-2xl hover:shadow-primary/30 transition-all"
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Analyser un vetement (Gratuit)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/demo")}
                  className="px-8 py-4 bg-surface/50 backdrop-blur-xl text-text border border-white/20 rounded-full font-bold text-lg tracking-tight hover:bg-surface/80 transition-all"
                >
                  Voir un exemple
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: 3D Floating Element with Parallax */}
          <motion.div
            style={{ y: parallaxY }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [-20, 20, -20],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-lg mx-auto"
            >
              {/* Glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl scale-110" />
              <div className="absolute inset-0 bg-gradient-to-tl from-accent/10 to-primary/10 rounded-3xl blur-2xl scale-105" />

              {/* Main container */}
              <div className="relative bg-surface/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                {/* Mock phone interface */}
                <div className="aspect-[9/19] bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-4 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      <span className="text-text font-bold text-sm">VINTED</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Product mockup */}
                  <div className="flex-1 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-center"
                    >
                      <Shirt className="w-24 h-24 text-primary/60 mx-auto mb-4" />
                      <p className="text-text font-bold text-lg">Sweat Nike Vintage</p>
                      <p className="text-primary font-black text-2xl">45,00 euros</p>
                    </motion.div>
                  </div>

                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary/40"
                      style={{
                        top: `${15 + i * 10}%`,
                        left: `${10 + (i % 3) * 25}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* BENTO GRID SECTION */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text mb-6">
              Puissance <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TURBO</span>
            </h2>
            <p className="text-text/70 text-xl max-w-2xl mx-auto">
              Technologie de pointe pour des resultats exceptionnels
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Card - AI Analysis */}
            <BentoCard className="md:col-span-2 lg:row-span-2 p-8">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ScanLine className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black text-text">Analyse IA Avancee</h3>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                  >
                    <Camera className="w-16 h-16 text-primary" />
                  </motion.div>
                </div>

                <p className="text-text/70 text-sm mt-6">
                  Notre IA scanne chaque detail pour identifier marque, etat et valeur reelle.
                </p>
              </div>
            </BentoCard>

            {/* Pricing Card */}
            <BentoCard className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl font-black text-accent mb-2"
                >
                  1,99 euros
                </motion.div>
                <p className="text-text/70 text-sm">Par analyse complete</p>
              </div>
            </BentoCard>

            {/* Speed Counter Card */}
            <BentoCard className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <motion.div
                  key={timerValue}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-black text-primary mb-2"
                >
                  {timerValue}s
                </motion.div>
                <p className="text-text/70 text-sm">Resultat instantane</p>
              </div>
            </BentoCard>

            {/* Trust Card */}
            <BentoCard className="md:col-span-2 p-6">
              <div className="flex items-center justify-between h-full">
                <div>
                  <h3 className="text-xl font-black text-text mb-2">100% Confidentiel</h3>
                  <p className="text-text/70 text-sm">Vos donnees sont chiffrees et jamais partagees</p>
                </div>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* WALL OF CASH - Social Proof Marquee */}
      <section className="relative py-16 bg-surface/30">
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: [-100, -200] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex gap-8 whitespace-nowrap"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-surface/50 backdrop-blur-sm rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-text font-medium">Sarah a gagne +45 euros</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-surface/50 backdrop-blur-sm rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-text font-medium">Thomas a expedie son colis</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-surface/50 backdrop-blur-sm rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-text font-medium">Lea a vendu en 10 minutes</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-surface/50 backdrop-blur-sm rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-text font-medium">Boost de +300% des ventes</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* UPLOAD SECTION */}
      <section id="upload" className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-black text-text mb-6">
              Pret a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">booster</span> ton dressing ?
            </h2>
            <p className="text-text/70 text-xl max-w-2xl mx-auto">
              Glisse ta photo de vetement et decouvre sa valeur reelle en quelques secondes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <UploadZone onFileSelect={handleFileSelect} disabled={isAnalyzing} />
          </motion.div>
        </div>
      </section>

      {/* MAGNETIC FOOTER */}
      <footer className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-text uppercase tracking-tighter leading-[0.8] mb-8">
              PRET A
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                VENDRE ?
              </span>
            </h2>
            <p className="text-text/60 text-xl max-w-2xl mx-auto mb-12">
              Rejoins les milliers d&apos;utilisateurs qui ont booste leurs ventes avec VINTED-TURBO
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.button
              onClick={scrollToUpload}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative px-12 py-6 bg-gradient-to-r from-primary to-accent text-secondary rounded-full font-black text-2xl tracking-tight shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                LANCER L&apos;ANALYSE
                <ArrowRight className="w-8 h-8" />
              </span>

              {/* Magnetic glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-xl scale-110 opacity-0 hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>

          {/* Footer links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-text/40 text-sm"
          >
            <div className="flex items-center gap-6">
              <span>(c) 2024 VINTED-TURBO</span>
              <span>•</span>
              <span>Fait avec amour pour les etudiants</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="hover:text-primary transition-colors">Confidentialite</button>
              <button className="hover:text-primary transition-colors">CGV</button>
              <button className="hover:text-primary transition-colors">Support</button>
            </div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </footer>
    </div>
  );
}