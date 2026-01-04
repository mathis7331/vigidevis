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
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import { GalaxyScene } from '@/components/GalaxyScene';

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
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Loading overlay */}
      {showProgress && <AnalysisProgress />}

      {/* Navigation - Imaginie Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-2xl tracking-wider">Imaginie</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors font-medium">
                How it works
              </a>
              <a href="#features" className="text-white/70 hover:text-white transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors font-medium">
                Pricing
              </a>
              <button className="text-white/70 hover:text-white transition-colors font-medium">
                Log in
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white"
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
                className="md:hidden mt-4 p-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10"
              >
                <a href="#how-it-works" className="block py-2 text-white/70 hover:text-white transition-colors">
                  How it works
                </a>
                <a href="#features" className="block py-2 text-white/70 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block py-2 text-white/70 hover:text-white transition-colors">
                  Pricing
                </a>
                <button className="block py-2 text-white/70 hover:text-white transition-colors">
                  Log in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* HERO SECTION - Imaginie Style */}
      <section className="relative min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="relative z-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[0.9] tracking-tight"
                style={{ fontFamily: 'serif' }}
              >
                Stay close to your
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  imagination.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/70 text-xl md:text-2xl max-w-xl leading-relaxed"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                Where ideas begin as sparks and emerge as living experiences through the power of AI. We transform what doesn't exist yet into something unforgettable.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const element = document.getElementById('upload');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-medium text-lg hover:bg-white/20 transition-all duration-300"
                >
                  See how it works
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">Begin the journey →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-purple-700 to-blue-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex items-center gap-4 pt-8"
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-white/60 text-sm">
                  Used by 12,000+ builders, creators, and professionals
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Galaxy Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative"
          >
            <div className="relative w-full max-w-2xl mx-auto aspect-square">
              {/* Glowing border frame */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 via-purple-600/20 to-blue-600/20 blur-2xl scale-105" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 via-purple-600/10 to-blue-600/10 blur-xl scale-110" />

              {/* Main frame container */}
              <div className="relative w-full h-full rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-orange-500/5 via-purple-600/5 to-blue-600/5" />

                {/* Three.js Canvas */}
                <div className="absolute inset-4 rounded-xl overflow-hidden">
                  <Canvas
                    camera={{ position: [0, 0, 30], fov: 60 }}
                    style={{ background: 'transparent' }}
                  >
                    <GalaxyScene />
                    <OrbitControls
                      enableZoom={false}
                      enablePan={false}
                      autoRotate
                      autoRotateSpeed={0.5}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-purple-600 opacity-80" />
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-80" />
                <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-blue-600 to-orange-400 opacity-80" />
                <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 opacity-80" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* UPLOAD SECTION - Simplified for Imaginie */}
      <section id="upload" className="relative py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to transform your <span className="bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">ideas</span>?
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              Upload your clothing item and let our AI create the perfect Vinted listing for you.
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
    </div>
  );
}