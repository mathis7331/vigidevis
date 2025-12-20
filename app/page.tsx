"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Sparkles, Car, Hammer, Stethoscope, Smartphone, TrendingDown, Eye, Play } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { HowItWorks } from "@/components/HowItWorks";
import { LiveSavingsBanner } from "@/components/LiveSavingsBanner";
import { StickyCTABar } from "@/components/StickyCTABar";
import { StatsSection } from "@/components/StatsSection";
import { HeroButton } from "@/components/HeroButton";
import { VideoSection } from "@/components/VideoSection";
import { VideoModal } from "@/components/VideoModal";
import { analyzeQuote } from "@/actions/analyze";
import { createAnalysis } from "@/actions/save-analysis";
import { toast } from "sonner";

const categories = [
  { 
    icon: Car,
    label: "Auto",
    color: "blue",
    bgColor: "bg-blue-50",
  },
  { 
    icon: Hammer,
    label: "Travaux",
    color: "orange",
    bgColor: "bg-orange-50",
  },
  { 
    icon: Stethoscope,
    label: "Santé",
    color: "red",
    bgColor: "bg-red-50",
  },
  { 
    icon: Smartphone,
    label: "Tech",
    color: "purple",
    bgColor: "bg-purple-50",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Home() {
  const router = useRouter();
  const uploadRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const scrollToUpload = () => {
    console.log("🖱️ Bouton cliqué ! Scroll vers l'upload...");
    
    if (uploadRef.current) {
      console.log("✅ Référence trouvée, scroll en cours...");
      
      const element = uploadRef.current;
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5 secondes pour un scroll très doux
      let start: number | null = null;
      
      // Fonction d'easing pour un mouvement fluide (ease-in-out)
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 
          ? 4 * t * t * t 
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };
      
      // Animation personnalisée du scroll
      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };
      
      requestAnimationFrame(animation);
    } else {
      console.error("❌ Référence uploadRef non trouvée !");
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' 
      };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 10MB.` 
      };
    }
    
    return { valid: true };
  };

  const handleFileSelect = async (file: File) => {
    // Validation
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error('Fichier invalide', { 
        description: validation.error,
        duration: 4000,
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.loading('Préparation du fichier...', { id: 'upload' });

      // Convert file to base64
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          toast.loading(`Lecture du fichier : ${percent}%`, { id: 'upload' });
        }
      };

      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Show progress screen
        toast.success('Fichier chargé !', { id: 'upload' });
        setShowProgress(true);

        // Wait 3 seconds for progress animation
        setTimeout(async () => {
          toast.loading('Envoi à l\'IA...', { id: 'analysis' });
          
          // Call server action with selected category
          const result = await analyzeQuote(base64, selectedCategory);

          if (result.success && result.data) {
            toast.success('Analyse terminée !', { id: 'analysis' });
            
            // Save analysis to KV store and get unique ID
            const saveResult = await createAnalysis(result.data, selectedCategory || undefined);
            
            if (saveResult.success && saveResult.id) {
              // Redirect to rapport page
              router.push(`/rapport/${saveResult.id}`);
            } else {
              setShowProgress(false);
              setIsAnalyzing(false);
              toast.error('Erreur de sauvegarde', { 
                id: 'analysis',
                description: saveResult.error || "Impossible de sauvegarder l'analyse"
              });
            }
          } else {
            setShowProgress(false);
            setIsAnalyzing(false);
            toast.error('Erreur d\'analyse', { 
              id: 'analysis',
              description: result.error || "Une erreur est survenue",
              action: {
                label: 'Réessayer',
                onClick: () => handleFileSelect(file)
              }
            });
          }
        }, 3000);
      };

      reader.onerror = () => {
        toast.error('Erreur de lecture', { 
          id: 'upload',
          description: "Impossible de lire le fichier" 
        });
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { 
        description: "Une erreur inattendue est survenue" 
      });
      setIsAnalyzing(false);
      setShowProgress(false);
    }
  };

  return (
    <>
      {showProgress && <AnalysisProgress />}

      {/* Live Savings Banner */}
      <LiveSavingsBanner />

      <main className="min-h-screen bg-white">
        {/* Header - VigiDevis */}
        <header className="py-5 px-6 border-b border-gray-100 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  VigiDevis
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium mb-8 text-sm">
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                <span>Intelligence Artificielle</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-[1.1] tracking-tight">
                Payez enfin
                <br />
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  le prix juste
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
                Analyse IA instantanée pour <span className="font-semibold text-emerald-600">7,99€</span>
                <br />
                <span className="text-lg text-gray-500">Remboursé si votre devis est déjà au prix juste</span>
              </p>

              {/* Hero CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <HeroButton onClick={scrollToUpload} />
                
                {/* VERSION 2 : Bouton Modal - Décommenter pour activer */}
                {/* <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  <Play className="w-5 h-5" strokeWidth={2.5} />
                  <span>Voir comment ça marche</span>
                </motion.button> */}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/demo")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm"
              >
                <Eye className="w-5 h-5" strokeWidth={2.5} />
                <span>Voir un exemple</span>
              </motion.button>

              {/* Économies détectées - discret sous le bouton */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm md:text-base text-gray-500 font-medium mb-16 flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                <span className="text-emerald-600">185 000€ d'économies</span> détectées ce mois-ci
              </motion.p>
            </motion.div>

            {/* Stats Section - Preuve Sociale */}
            <div className="mb-16">
              <StatsSection />
            </div>

            {/* VERSION 1 : Vidéo Démo Intégrée */}
            <VideoSection 
              videoUrl="/demo-video.mp4" 
              posterUrl="/video-poster.jpg"
              title="Découvrez VigiDevis en action"
            />

            {/* Catégories avec Icônes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Choisissez votre catégorie
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <CategoryBadge
                    key={cat.label}
                    icon={cat.icon}
                    label={cat.label}
                    color={cat.color}
                    bgColor={cat.bgColor}
                    isActive={selectedCategory === cat.label}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.label ? null : cat.label)
                    }
                  />
                ))}
              </div>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
              id="upload-section"
              ref={uploadRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-3xl mx-auto scroll-mt-24"
            >
              <UploadZone onFileSelect={handleFileSelect} disabled={isAnalyzing} />
              
              {/* Réassurance Sécurité */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span>100% confidentiel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span>RGPD Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span>Paiement sécurisé</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-sm text-gray-500 mb-4">
                Rejoignez des milliers d'utilisateurs qui économisent chaque jour
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">100% Confidentiel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Analyse en 3 secondes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Sans inscription</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-900">VigiDevis</span>
              </div>
              <p className="text-sm text-gray-500">
                © 2024 VigiDevis. Propulsé par l'Intelligence Artificielle.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky CTA Bar (Mobile Only) */}
      <StickyCTABar onScanClick={scrollToUpload} />

      {/* VERSION 2 : Modal Vidéo - S'ouvre quand on clique sur "Voir comment ça marche" */}
      <VideoModal 
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl="/demo-video.mp4"
        title="Découvrez VigiDevis en action"
      />
    </>
  );
}
