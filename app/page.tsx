"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { createPendingAnalysis } from "@/actions/create-pending-analysis";
import { compressImageIfNeeded } from "@/lib/image-compression";
import { toast } from "sonner";
import { CinematicPortalScene } from "@/components/CinematicPortalScene";

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
      setShowProgress(true);

      // Check document first (with original file)
      const formData = new FormData();
      formData.append('file', file);

      const checkResponse = await fetch('/api/check-document', {
        method: 'POST',
        body: formData,
      });

      if (!checkResponse.ok) {
        throw new Error('Document validation failed');
      }

      const checkData = await checkResponse.json();

      if (checkData.valid !== true) {
        throw new Error('Invalid document type');
      }

      // Compress and convert to base64
      const base64String = await compressImageIfNeeded(file);
      const imageBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;

      // Create pending analysis
      const pendingAnalysis = await createPendingAnalysis(imageBase64);
      if (!pendingAnalysis.success || !pendingAnalysis.id) {
        throw new Error('Failed to create pending analysis');
      }

      // Upload to analysis (convert base64 back to File for FormData)
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      const compressedFile = new File([blob], file.name, { type: file.type });

      const analysisFormData = new FormData();
      analysisFormData.append('file', compressedFile);
      analysisFormData.append('analysisId', pendingAnalysis.id);

      const analysisResponse = await fetch('/api/analysis/' + pendingAnalysis.id, {
        method: 'POST',
        body: analysisFormData,
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      router.push('/rapport/' + pendingAnalysis.id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'analyse. Veuillez réessayer.');
      setIsAnalyzing(false);
      setShowProgress(false);
    }
  };

  const scrollToUpload = () => {
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#010103] overflow-hidden">
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
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
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
        </div>
      </nav>

      {/* HERO SECTION - Two Column Layout */}
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
              {/* Main Headline - Playfair Display */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white/90 leading-[0.9] tracking-tight"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Stay close to your
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  imagination.
                </span>
              </motion.h1>

              {/* Subtitle - Inter */}
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
                  onClick={scrollToUpload}
                  className="px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 transition-all duration-300"
                >
                  See how it works
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Begin the journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

          {/* Right: Portal 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative w-full h-[600px] lg:h-[700px]"
          >
            <CinematicPortalScene />
          </motion.div>
        </div>
      </section>

      {/* UPLOAD SECTION */}
      <section id="upload" className="relative py-24 px-6 bg-[#010103]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>
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
