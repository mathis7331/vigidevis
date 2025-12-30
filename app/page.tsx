"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Sparkles, ShoppingBag, Heart, Camera, TrendingDown, Eye, Play, Lock, HelpCircle, CheckCircle2, Zap, RotateCcw } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { HowItWorks } from "@/components/HowItWorks";
import { LiveSavingsBanner } from "@/components/LiveSavingsBanner";
import { StickyCTABar } from "@/components/StickyCTABar";
import { StatsSection } from "@/components/StatsSection";
import { HeroButton } from "@/components/HeroButton";
import { HeroPreview } from "@/components/HeroPreview";
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
        let base64 = reader.result as string;
        
        // ÉTAPE 0 : Compression de l'image si nécessaire (avant pré-vérification)
        try {
          toast.loading('Optimisation de l\'image...', { id: 'upload' });
          base64 = await compressImageIfNeeded(file);
        } catch (compressionError) {
          console.error('Erreur lors de la compression:', compressionError);
          // Continuer avec l'image originale si la compression échoue
        }
        
        // ÉTAPE 1 : Pré-vérification gratuite avec gpt-4o-mini
        toast.loading('Analyse du document en cours...', { id: 'upload' });
        
        try {
          // Extraire le base64 pur (sans le préfixe data:image/...)
          const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
          
          const checkResponse = await fetch('/api/check-document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          const checkData = await checkResponse.json();

          // Vérifier que la réponse est exactement VALID
          if (!checkData.success || !checkData.valid || checkData.result !== "VALID") {
            // Document non reconnu comme vêtement valide
            toast.error('Photo non reconnue comme un vêtement', {
              id: 'upload',
              description: "Veuillez uploader une vraie photo de vêtement pour continuer."
            });
            setIsAnalyzing(false);
            return;
          }

          // Document valide, continuer avec le processus normal
          toast.loading('Préparation de ton vêtement...', { id: 'upload' });
          setShowProgress(true);

          // Wait 2 seconds for progress animation (simulation)
          setTimeout(async () => {
            // Save image to KV store WITHOUT analysis (saves OpenAI credits!)
            const saveResult = await createPendingAnalysis(base64Data, selectedCategory || undefined);

            if (saveResult.success && saveResult.id) {
              toast.success('Vêtement prêt !', { id: 'upload' });
              setShowProgress(false);
              setIsAnalyzing(false);

              // Redirect to rapport page (will show paywall)
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
        } catch (checkError) {
          console.error('Error checking document:', checkError);
          // En cas d'erreur de vérification, on continue quand même (pour ne pas bloquer)
          toast.loading('Préparation de ton vêtement...', { id: 'upload' });
          setShowProgress(true);

          setTimeout(async () => {
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
            const saveResult = await createPendingAnalysis(base64Data, selectedCategory || undefined);
            
            if (saveResult.success && saveResult.id) {
              toast.success('Devis prêt !', { id: 'upload' });
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
        {/* Header - VINTED-TURBO */}
        <header className="py-5 px-6 border-b border-gray-100 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight">
                  VINTED-TURBO
                </h1>
              </div>
            </div>
            <motion.a
              href="#faq"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
              <span>Comment ça marche</span>
            </motion.a>
          </div>
        </header>

        {/* Hero Section - Approche Conversion Agressive */}
        <section className="py-12 md:py-20 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Mobile: Structure verticale simple */}
            <div className="block sm:hidden space-y-8">
              {/* Section 1: Texte (Haut) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium mb-4 text-sm">
                  <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                  <span>Intelligence Artificielle</span>
                </div>

                {/* Headline H1 - Percutant */}
                <h1 className="text-3xl font-black mb-4 text-text leading-tight tracking-tight">
                  Vends tes sapes en{" "}
                  <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                    2 clics
                  </span>
                  📸
                  <br />
                  <span className="text-gray-800">L'IA analyse ton vêtement et crée l'annonce Vinted parfaite.</span>
                </h1>

                {/* Sous-titre avec stat */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base text-gray-700 mb-6 font-medium leading-relaxed"
                >
                  Arrête de galérer avec tes descriptions.{" "}
                  <span className="font-bold text-primary">L'IA rédige tout pour toi et te dit combien ça vaut vraiment.</span>
                </motion.p>

                {/* CTA Button Principal - Élégant */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <HeroButton onClick={scrollToUpload} />
                </motion.div>

                {/* Bouton Voir un exemple */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => router.push("/demo")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  <Eye className="w-5 h-5" strokeWidth={2.5} />
                  <span>Voir un exemple</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Desktop: Grid 2 colonnes classique */}
            <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Colonne gauche : Contenu textuel */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left lg:text-left"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium mb-6 text-sm">
                  <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                  <span>Intelligence Artificielle</span>
                </div>

                {/* Headline H1 - Agressive */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-text leading-tight tracking-tight">
                  Vends tes sapes en{" "}
                  <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                    2 clics
                  </span>
                  📸
                  <br />
                  <span className="text-gray-800">L'IA analyse ton vêtement et crée l'annonce Vinted parfaite.</span>
                </h1>

                {/* Sous-titre avec stat */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-gray-700 mb-8 font-medium leading-relaxed"
                >
                  Arrête de galérer avec tes descriptions.{" "}
                  <span className="font-bold text-primary">L'IA rédige tout pour toi et te dit combien ça vaut vraiment.</span>
                </motion.p>

                {/* CTA Button - Élégant */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4"
                >
                  <HeroButton onClick={scrollToUpload} />
                </motion.div>

                {/* Bouton Voir un exemple */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => router.push("/demo")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:border-primary hover:text-primary transition-all shadow-sm mb-6"
                >
                  <Eye className="w-5 h-5" strokeWidth={2.5} />
                  <span>Voir un exemple</span>
                </motion.button>

                {/* Réassurance rapide */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-4 text-sm text-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" strokeWidth={2} />
                    <span>100% Confidentiel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" strokeWidth={2} />
                    <span>Résultat en 30s</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Colonne droite : Prévisualisation ou Rapport de démonstration */}
              {/* Colonne droite : HeroPreview par défaut, ou rien si le demo loading est affiché */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <HeroPreview />
              </motion.div>

            </div>
          </div>
        </section>

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
                  <p className="text-sm text-gray-600">Devis supprimé après analyse</p>
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
