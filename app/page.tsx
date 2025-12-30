"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Sparkles, ShoppingBag, Heart, Camera, TrendingDown, Eye, Play, Lock, HelpCircle, CheckCircle2, Zap, RotateCcw, Trash2, Shield } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { HowItWorks } from "@/components/HowItWorks";
import { LiveSavingsBanner } from "@/components/LiveSavingsBanner";
import { StickyCTABar } from "@/components/StickyCTABar";
import { StatsSection } from "@/components/StatsSection";
import { HeroButton } from "@/components/HeroButton";
import { HeroPreview } from "@/components/HeroPreview";
import { Hero } from "@/components/Hero";
import { VideoSection } from "@/components/VideoSection";
import { VideoModal } from "@/components/VideoModal";
import { FAQ } from "@/components/FAQ";
import { Testimonials } from "@/components/Testimonials";
import { createPendingAnalysis } from "@/actions/create-pending-analysis";
import { compressImageIfNeeded } from "@/lib/image-compression";
import { toast } from "sonner";

const categories = [
  {
    icon: Shirt,
    label: "Vêtements",
    color: "primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: ShoppingBag,
    label: "Accessoires",
    color: "accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Sparkles,
    label: "Vintage",
    color: "secondary",
    bgColor: "bg-secondary",
  },
  {
    icon: Heart,
    label: "Mode",
    color: "text",
    bgColor: "bg-text/10",
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
  const [showExample, setShowExample] = useState(false);

  const scrollToUpload = () => {
    if (uploadRef.current) {
      const element = uploadRef.current;
      
      // Détection mobile pour optimiser le scroll
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      if (isMobile) {
        // Sur mobile : utiliser scrollIntoView natif (plus fluide et performant)
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: "center",
          inline: "nearest"
        });
      } else {
        // Sur desktop : animation personnalisée plus douce
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800; // Plus rapide pour être plus fluide
        let start: number | null = null;
        
        // Easing optimisé pour fluidité (ease-out quad)
        const easeOutQuad = (t: number): number => {
          return t * (2 - t);
        };
        
        const animation = (currentTime: number) => {
          if (start === null) start = currentTime;
          const timeElapsed = currentTime - start;
          const progress = Math.min(timeElapsed / duration, 1);
          const ease = easeOutQuad(progress);
          
          window.scrollTo({
            top: startPosition + distance * ease,
            behavior: "auto" // Utiliser auto pour contrôle manuel
          });
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        };
        
        requestAnimationFrame(animation);
      }
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
    console.log('[UPLOAD] Fichier sélectionné:', file.name, file.type, file.size);
    
    // Validation
    const validation = validateFile(file);
    if (!validation.valid) {
      console.error('[UPLOAD] Validation échouée:', validation.error);
      toast.error('Fichier invalide', { 
        description: validation.error,
        duration: 4000,
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setShowProgress(false); // S'assurer que le progress n'est pas déjà affiché
      toast.loading('Préparation du fichier...', { id: 'upload' });
      console.log('[UPLOAD] Début du traitement...');

      // Convert file to base64
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          toast.loading(`Lecture du fichier : ${percent}%`, { id: 'upload' });
        }
      };

      reader.onload = async () => {
        let base64 = reader.result as string;
        console.log('[UPLOAD] Fichier converti en base64, taille:', base64.length);
        
        // ÉTAPE 0 : Compression de l'image si nécessaire (avant pré-vérification)
        try {
          toast.loading('Optimisation de l\'image...', { id: 'upload' });
          base64 = await compressImageIfNeeded(file);
          console.log('[UPLOAD] Image compressée, nouvelle taille:', base64.length);
        } catch (compressionError) {
          console.error('[UPLOAD] Erreur lors de la compression:', compressionError);
          // Continuer avec l'image originale si la compression échoue
        }
        
        // ÉTAPE 1 : Pré-vérification gratuite avec gpt-4o-mini
        toast.loading('Vérification de la photo...', { id: 'upload' });
        
        try {
          // Extraire le base64 pur (sans le préfixe data:image/...)
          const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
          
          console.log('[UPLOAD] Envoi de la vérification à l\'API...');
          const checkResponse = await fetch('/api/check-document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          if (!checkResponse.ok) {
            console.error('[UPLOAD] Erreur HTTP:', checkResponse.status, checkResponse.statusText);
            throw new Error(`Erreur HTTP: ${checkResponse.status}`);
          }

          const checkData = await checkResponse.json();
          console.log('[UPLOAD] Réponse de vérification:', checkData);

          // Vérifier que la réponse est exactement VALID
          if (!checkData.success || !checkData.valid || checkData.result !== "VALID") {
            // Photo non reconnue comme vêtement valide
            toast.error('Photo non reconnue', {
              id: 'upload',
              description: "Assure-toi que la photo montre bien un vêtement, un accessoire ou des chaussures."
            });
            setIsAnalyzing(false);
            setShowProgress(false);
            return;
          }

          // Document valide, continuer avec le processus normal
          toast.loading('Préparation de ton vêtement...', { id: 'upload' });
          setShowProgress(true);

          // Wait 2 seconds for progress animation (simulation)
          setTimeout(async () => {
            console.log('[UPLOAD] Sauvegarde de l\'analyse...');
            // Save image to KV store WITHOUT analysis (saves OpenAI credits!)
            const saveResult = await createPendingAnalysis(base64Data, selectedCategory || undefined);
            console.log('[UPLOAD] Résultat de sauvegarde:', saveResult);

            if (saveResult.success && saveResult.id) {
              toast.success('Vêtement prêt !', { id: 'upload' });
              setShowProgress(false);
              setIsAnalyzing(false);

              // Redirect to rapport page (will show paywall)
              console.log('[UPLOAD] Redirection vers /rapport/' + saveResult.id);
              router.push(`/rapport/${saveResult.id}`);
            } else {
              console.error('[UPLOAD] Erreur de sauvegarde:', saveResult.error);
              setShowProgress(false);
              setIsAnalyzing(false);
              toast.error('Erreur', {
                id: 'upload',
                description: saveResult.error || "Impossible de sauvegarder le vêtement"
              });
            }
          }, 2000);
        } catch (checkError) {
          console.error('[UPLOAD] Erreur lors de la vérification:', checkError);
          // En cas d'erreur de vérification, on continue quand même (pour ne pas bloquer)
          toast.loading('Préparation de ton vêtement...', { id: 'upload' });
          setShowProgress(true);

          setTimeout(async () => {
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
            const saveResult = await createPendingAnalysis(base64Data, selectedCategory || undefined);
            
            if (saveResult.success && saveResult.id) {
              toast.success('Photo prête !', { id: 'upload' });
              setShowProgress(false);
              setIsAnalyzing(false);
              router.push(`/rapport/${saveResult.id}`);
            } else {
              setShowProgress(false);
              setIsAnalyzing(false);
              toast.error('Erreur', {
                id: 'upload',
                description: saveResult.error || "Impossible de sauvegarder le vêtement"
              });
            }
          }, 2000);
        }
      };

      reader.onerror = (error) => {
        console.error('[UPLOAD] Erreur de lecture du fichier:', error);
        toast.error('Erreur de lecture', { 
          id: 'upload',
          description: "Impossible de lire le fichier" 
        });
        setIsAnalyzing(false);
        setShowProgress(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[UPLOAD] Erreur générale:', error);
      toast.error('Erreur', {
        id: 'upload',
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue"
      });
      setIsAnalyzing(false);
      setShowProgress(false);
    }
  };

  return (
    <>
      {showProgress && <AnalysisProgress />}

      {/* Hero Section Premium Style Awwwards */}
      <Hero 
        onUploadClick={scrollToUpload}
        onExampleClick={() => router.push("/demo")}
      />

      <main className="min-h-screen bg-white">

        {/* Section Contenu Principal */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Nouvelle section de réassurance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-16 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bloc 1 */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">100% Confidentiel</p>
                  <p className="text-sm text-gray-600">Aucune donnée transmise au prestataire</p>
                </div>

                {/* Bloc 2 */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
                    <Trash2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Suppression auto</p>
                  <p className="text-sm text-gray-600">Photo supprimée après analyse</p>
                </div>

                {/* Bloc 3 */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
                    <RotateCcw className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Remboursé</p>
                  <p className="text-sm text-gray-600">Si le prix est déjà juste</p>
                </div>
              </div>
            </motion.div>

            {/* VERSION 1 : Vidéo Démo Intégrée */}
            <VideoSection
              videoUrl="/demo-video.mp4"
              posterUrl="/video-poster.jpg"
              title="Nos témoignages"
            />

            {/* Stats Section - Preuve Sociale */}
            <div className="mb-16">
              <StatsSection />
            </div>

            {/* Catégories avec Icônes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-text mb-8 text-center">
                Quel type d'article vends-tu ?
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
              id="upload"
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
                  <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span>100% confidentiel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span>RGPD Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
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
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-gray-700">100% Confidentiel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-sm font-medium text-gray-700">Analyse en 30 secondes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-sm font-medium text-gray-700">Sans inscription</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Témoignages */}
        <Testimonials />

        {/* FAQ */}
        <div id="faq">
          <FAQ />
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-6">
              {/* Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
                <Link 
                  href="/cgv" 
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  CGV
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  href="/politique-confidentialite" 
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  Politique de Confidentialité
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  href="/mentions-legales" 
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  Mentions Légales
                </Link>
              </div>
              
              {/* Brand & Copyright */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-text">VINTED-TURBO</span>
                </div>
                <p className="text-sm text-gray-500">
                  © 2024 VINTED-TURBO. Fait avec ❤️ pour les étudiants à Mons.
                </p>
              </div>
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
        title="Nos témoignages"
      />
    </>
  );
}
