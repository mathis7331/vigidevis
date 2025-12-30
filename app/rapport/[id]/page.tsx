"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Home,
  Shield,
  TrendingDown,
  Copy,
  Check,
  RefreshCcw,
  BarChart3,
  DollarSign,
  Lightbulb,
  Search,
  MessageSquare,
  Share2,
  Camera,
  ShoppingBag,
  Lock,
} from "lucide-react";
import { CircularScore } from "@/components/CircularScore";
import { LineItemCard } from "@/components/LineItemCard";
import { Paywall } from "@/components/Paywall";
import { StoredAnalysis } from "@/lib/kv";
import { AnalysisResult } from "@/lib/types";
import { getPricingForCategory } from "@/lib/pricing";
import { toast } from "sonner";

function RapportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);

  // Données de démonstration pour DEMO12345
  const demoAnalysisResult: AnalysisResult = {
    item_analysis: {
      brand: "Nike",
      type: "Sweatshirt",
      color: "Gris",
      condition_score: 8,
      estimated_era: "Y2K"
    },
    sales_copy: {
      seo_title: "Sweat Nike Vintage Gris - Oversize - Y2K",
      description: `• État : Excellent état, porté quelques fois (8/10) ✨
• Taille : L (convient M-XL, coupe oversize)
• Marque : Nike vintage authentique
• Couleur : Gris chiné avec logo swoosh blanc
• Style Tip : Le porter avec un jean baggy pour un look 2000s parfait ! 💯`,
      hashtags: ["#vintage", "#nike", "#y2k", "#streetwear", "#90s", "#mode", "#fashion", "#vêtements", "#secondemain", "#vinted", "#retro", "#oversize", "#sweat", "#gris", "#swoosh"]
    },
    pricing: {
      fast_sell_price: 15,
      market_price: 25,
      pro_negotiation_price: 35
    }
  };

  useEffect(() => {
    // Cas spécial pour DEMO12345
    // Le chargement est déjà fait dans /demo, donc on affiche directement le rapport
    if (id === "DEMO12345") {
      setLoading(false);
      return;
    }

    async function fetchAnalysis() {
      try {
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();

        if (!data.success) {
          toast.error("Erreur", { description: "Analyse introuvable" });
          router.push("/");
          return;
        }

        setAnalysis(data.analysis);

        // Check if payment was successful
        const payment = searchParams.get("payment");
        
        if (payment === "success") {
          // SÉCURITÉ : Ne jamais faire confiance au paramètre URL
          // On attend que le webhook Stripe ait marqué l'analyse comme payée
          toast.loading("Vérification du paiement...", { id: "payment-check" });
          
          // L'analyse OpenAI peut prendre 10-20 secondes, on fait plusieurs tentatives
          let attempts = 0;
          const maxAttempts = 20; // 20 tentatives sur ~60 secondes
          const checkInterval = 3000; // 3 secondes entre chaque tentative
          
          const checkPayment = async (): Promise<boolean> => {
            attempts++;
            console.log(`[Payment Check] Attempt ${attempts}/${maxAttempts} for analysis ${id}`);
            
            try {
              const response = await fetch(`/api/analysis/${id}`);
              const data = await response.json();
              
              if (data.success && data.analysis) {
                setAnalysis(data.analysis);
                
                if (data.analysis.isPaid) {
                  // Vérifier s'il y a une erreur
                  if (data.analysis.error) {
                    console.error(`[Payment Check] Analysis ${id} has error:`, data.analysis.error);
                    toast.error("Erreur d'analyse", { 
                      id: "payment-check",
                      description: "L'analyse a échoué. Vous pouvez réessayer avec le bouton ci-dessous."
                    });
                    setShowPaywall(false);
                    return true; // Arrêter le polling, afficher l'erreur
                  }
                  
                  // Si l'analyse est en cours (payé mais pas encore de résultat)
                  if (data.analysis.isPaid && !data.analysis.result) {
                    toast.loading("Analyse en cours...", { 
                      id: "payment-check",
                      description: `Votre devis est en train d'être analysé par l'IA (${attempts}/${maxAttempts})` 
                    });
                    return false; // Continuer à vérifier
                  }
                  
                  // Analyse complète !
                  toast.success("Paiement confirmé !", { 
                    id: "payment-check",
                    description: "Votre analyse complète est maintenant disponible" 
                  });
                  setShowPaywall(false);
                  return true; // Succès
                } else {
                  // Pas encore payé, continuer à vérifier
                  console.log(`[Payment Check] Analysis ${id} not yet marked as paid`);
                  return false;
                }
              } else {
                console.error(`[Payment Check] Failed to fetch analysis ${id}:`, data.error);
                return false;
              }
            } catch (error) {
              console.error(`[Payment Check] Error checking payment for ${id}:`, error);
              return false;
            }
          };
          
          // Première vérification après 2 secondes (le webhook peut être rapide)
          const startChecking = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            let done = false;
            while (!done && attempts < maxAttempts) {
              done = await checkPayment();
              
              if (!done && attempts < maxAttempts) {
                // Attendre avant la prochaine tentative
                await new Promise(resolve => setTimeout(resolve, checkInterval));
              }
            }
            
            // Si on a atteint le max sans succès
            if (!done && attempts >= maxAttempts) {
              console.error(`[Payment Check] Timeout after ${maxAttempts} attempts for ${id}`);
              toast.error("Le paiement est en cours de traitement", { 
                id: "payment-check",
                description: "Veuillez recharger la page dans quelques instants. Si le problème persiste, contactez le support."
              });
            }
          };
          
          startChecking();
        } else if (payment === "cancelled") {
          toast.info("Paiement annulé", {
            description: "Vous pouvez débloquer l'analyse à tout moment"
          });
        }

        // SÉCURITÉ : Le paywall se base UNIQUEMENT sur data.analysis.isPaid
        // qui vient du serveur (mis à jour par le webhook Stripe)
        if (!data.analysis.isPaid) {
          setShowPaywall(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Erreur", { description: "Impossible de charger l'analyse" });
        router.push("/");
      }
    }

    fetchAnalysis();
  }, [id, router, searchParams]);

  // POLLING AUTOMATIQUE : Si payé mais analyse pas encore terminée
  // ⚠️ IMPORTANT : Ce useEffect DOIT être déclaré AVANT tous les returns conditionnels
  useEffect(() => {
    // Ne démarrer le polling que si l'analyse est payée mais pas encore terminée
    if (!analysis || !analysis.isPaid || analysis.result || analysis.error) {
      return;
    }

    // Enregistrer le temps de début si ce n'est pas déjà fait
    if (analysisStartTime === null) {
      setAnalysisStartTime(Date.now());
    }

    const maxPollingAttempts = 60; // 60 tentatives = 3 minutes max (3s * 60)
    const pollingInterval = 3000; // 3 secondes entre chaque vérification
    const maxDuration = 3 * 60 * 1000; // 3 minutes maximum

    let attempts = 0;
    let pollingActive = true;

    const pollAnalysis = async () => {
      if (!pollingActive) return;

      attempts++;
      setPollingAttempts(attempts);

      // Vérifier le timeout
      const elapsed = analysisStartTime ? Date.now() - analysisStartTime : 0;
      if (elapsed > maxDuration) {
        console.error(`[POLLING] Timeout after ${elapsed}ms for analysis ${id}`);
        pollingActive = false;
        toast.error("L'analyse prend plus de temps que prévu", {
          description: "Veuillez recharger la page ou contacter le support si le problème persiste.",
        });
        return;
      }

      // Vérifier le nombre de tentatives
      if (attempts >= maxPollingAttempts) {
        console.error(`[POLLING] Max attempts reached (${maxPollingAttempts}) for analysis ${id}`);
        pollingActive = false;
        toast.error("L'analyse prend plus de temps que prévu", {
          description: "Veuillez recharger la page ou contacter le support si le problème persiste.",
        });
        return;
      }

      try {
        console.log(`[POLLING] Attempt ${attempts}/${maxPollingAttempts} for analysis ${id}`);
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();

        if (data.success && data.analysis) {
          setAnalysis(data.analysis);

          // Si l'analyse est terminée (avec résultat ou erreur)
          if (data.analysis.result) {
            console.log(`[POLLING] ✅ Analysis ${id} completed with result`);
            pollingActive = false;
            toast.success("Analyse terminée !", {
              description: "Votre rapport est maintenant disponible.",
            });
            return;
          }

          if (data.analysis.error) {
            console.log(`[POLLING] ❌ Analysis ${id} has error:`, data.analysis.error);
            pollingActive = false;
            toast.error("Erreur d'analyse", {
              description: "L'analyse a échoué. Vous pouvez réessayer avec le bouton ci-dessous.",
            });
            return;
          }

          // Sinon, continuer le polling
          if (pollingActive && attempts < maxPollingAttempts) {
            setTimeout(pollAnalysis, pollingInterval);
          }
        } else {
          console.error(`[POLLING] Failed to fetch analysis ${id}:`, data.error);
          // Continuer quand même le polling en cas d'erreur réseau temporaire
          if (pollingActive && attempts < maxPollingAttempts) {
            setTimeout(pollAnalysis, pollingInterval);
          }
        }
      } catch (error) {
        console.error(`[POLLING] Error polling analysis ${id}:`, error);
        // Continuer le polling en cas d'erreur
        if (pollingActive && attempts < maxPollingAttempts) {
          setTimeout(pollAnalysis, pollingInterval);
        }
      }
    };

    // Démarrer le polling après 2 secondes (donner le temps au webhook)
    const timeoutId = setTimeout(() => {
      pollAnalysis();
    }, 2000);

    // Cleanup
    return () => {
      pollingActive = false;
      clearTimeout(timeoutId);
    };
  }, [analysis?.isPaid, analysis?.result, analysis?.error, id, analysisStartTime]);

  const calculateTotalSavings = () => {
    if (!analysis || !analysis.result) return 0;
    return analysis.result.line_items.reduce((total, item) => {
      const quotedNum = parseFloat(item.quoted_price.replace(/[^\d.,]/g, "").replace(",", "."));
      const marketNum = parseFloat(item.market_price.replace(/[^\d.,]/g, "").replace(",", "."));
      
      if (isNaN(quotedNum) || isNaN(marketNum)) return total;
      
      const savings = quotedNum - marketNum;
      return total + (savings > 0 ? savings : 0);
    }, 0);
  };

  const copyToClipboard = async () => {
    if (!analysis || !analysis.result) return;
    
    const result = analysis.result!; // Non-null assertion après vérification
    try {
      await navigator.clipboard.writeText(result.negotiation_tip);
      setCopied(true);
      toast.success("Message copié !", { 
        description: "Prêt à être envoyé par SMS ou email" 
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Erreur", { description: "Impossible de copier" });
    }
  };

  const shareAnalysis = async (platform: "whatsapp" | "twitter" | "email", savings: number = 0) => {
    const url = `${window.location.origin}/rapport/${id}`;
    const savingsAmount = savings > 0 ? savings : (analysis?.result ? calculateTotalSavings() : 0);
    const text = `J'ai économisé ${savingsAmount.toFixed(0)}€ sur mon devis grâce à VigiDevis ! 💰`;

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent("Regarde cette analyse VigiDevis")}&body=${encodeURIComponent(`${text}\n\nVoir le rapport complet : ${url}`)}`;
        break;
    }

    toast.success("Partagé !", { description: "Merci de faire connaître VigiDevis" });
  };

  const copyToClipboardDemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Message copié !", {
      description: "Prêt à être envoyé par SMS ou email" 
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const renderReport = (result: AnalysisResult, totalSavings: number, reportId: string, isDemo: boolean) => {
    return (
      <main className="min-h-screen bg-gradient-to-b from-secondary to-white">
        {/* Header */}
        <header className="py-3 sm:py-5 px-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text tracking-tight">
                VINTED-TURBO
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 hidden sm:block">
                Rapport #{reportId}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs sm:text-sm shadow-lg hover:bg-gray-800 transition-colors"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">Accueil</span>
              </motion.button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Vinted Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
              {/* Mock Vinted Header */}
              <div className="bg-primary px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white font-bold text-lg">Vinted</span>
              </div>

              {/* Product Image Placeholder */}
              <div className="aspect-square bg-secondary flex items-center justify-center relative">
                <Camera className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Photo de ton vêtement
                </div>
              </div>

              {/* Product Info - FREE SECTION */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-text mb-2">
                  {result.item_analysis.brand} {result.item_analysis.type}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-black text-primary">
                    {result.pricing.market_price}€
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {result.pricing.pro_negotiation_price}€
                  </span>
                </div>

                {/* Condition Badge */}
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  État: {result.item_analysis.condition_score}/10
                </div>
              </div>

              {/* BLURRED SECTION - Premium Content */}
              <div className="relative">
                {/* Blur overlay for locked content */}
                {!showPaywall && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-gray-600 font-semibold mb-2">Contenu Premium Débloqué</p>
                      <p className="text-sm text-gray-500">Description et hashtags optimisés</p>
                    </div>
                  </div>
                )}

                {/* Actual content (shown when unlocked) */}
                <div className="p-6 border-t border-gray-100">
                  <div className="mb-4">
                    <h3 className="font-semibold text-text mb-2">Description complète :</h3>
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                      {result.sales_copy.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-text mb-2">Prix conseillé pour vente rapide :</h3>
                    <span className="text-xl font-bold text-accent">
                      {result.pricing.fast_sell_price}€
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text mb-2">Hashtags optimisés :</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.sales_copy.hashtags.map((hashtag, index) => (
                        <span key={index} className="bg-secondary text-text px-2 py-1 rounded-full text-xs">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA to Unlock Premium Content */}
          {showPaywall && !isDemo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 sm:mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary to-accent text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

              <div className="relative text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Débloque ta description parfaite !</h3>
                <p className="text-white/90 mb-6 text-lg">
                  Obtiens la description optimisée, les hashtags tendance et le prix parfait pour vendre en 24h
                </p>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">1.99€</div>
                  <p className="text-white/80 text-sm mb-6">Prix d'un café pour une annonce qui cartonne</p>
                  <button
                    onClick={() => {/* Stripe payment logic will go here */}}
                    className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-2xl hover:bg-white/90 transition-all shadow-lg"
                  >
                    Obtenir mon annonce optimisée
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Copy-Paste Feature (only when unlocked) */}
          {!showPaywall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 sm:mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

              <div className="relative text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Copy className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ta annonce est prête !</h3>
                <p className="text-white/90 mb-6 text-lg">
                  Copie tout d'un clic et colle directement dans Vinted
                </p>

                <button
                  onClick={() => {
                    const fullContent = `${result.sales_copy.seo_title}\n\n${result.sales_copy.description}\n\n${result.sales_copy.hashtags.join(' ')}`;
                    navigator.clipboard.writeText(fullContent);
                    setCopied(true);
                    toast.success("Annonce copiée ! 📋", {
                      description: "Prête à coller dans Vinted"
                    });
                    setTimeout(() => setCopied(false), 3000);
                  }}
                  className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-2xl hover:bg-white/90 transition-all shadow-lg flex items-center gap-3 mx-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" strokeWidth={2.5} />
                      <span>COPIER TOUT 📋</span>
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-white/10 rounded-xl">
                  <p className="text-white/80 text-sm">
                    💡 <strong>Astuce :</strong> Utilise le prix de {result.pricing.fast_sell_price}€ pour vendre en 24h ou {result.pricing.market_price}€ pour maximiser tes bénéfices !
                  </p>
                </div>
              </div>
            </motion.div>
          )}


          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center pt-6 sm:pt-8 border-t border-gray-200"
          >
            {isDemo && (
              <motion.button
                onClick={() => router.push("/")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base sm:text-lg shadow-lg transition-colors"
              >
                <span>Analyser un autre vêtement</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.div>
              </motion.button>
            )}

            {!isDemo && !showPaywall && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  💫 Bonne vente sur Vinted ! N'hésite pas à revenir pour ton prochain article.
                </p>
                <motion.button
                  onClick={() => router.push("/")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-text font-bold text-base sm:text-lg shadow-lg transition-colors border-2 border-gray-200"
                >
                  <span>Analyser un autre vêtement</span>
                  <Camera className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  };

  // Gestion du cas DEMO12345 (AVANT le check loading pour éviter le spinner infini)
  // Le chargement est déjà fait dans /demo, donc on affiche directement le rapport
  if (id === "DEMO12345") {
    // Utiliser les données de démonstration
    const result = demoAnalysisResult;
    // Pour la démo, on utilise le prix du marché comme "totalSavings" pour l'affichage
    const totalSavings = result.pricing.market_price;

    return renderReport(result, totalSavings, id, true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre rapport...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Fonction pour réessayer l'analyse
  const handleRetryAnalysis = async () => {
    setIsRetrying(true);
    toast.loading("Relance de l'analyse...", { id: "retry-analysis" });

    try {
      const response = await fetch(`/api/analysis/${id}/retry`, {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        toast.error("Erreur", {
          id: "retry-analysis",
          description: data.error || "Impossible de relancer l'analyse",
        });
        setIsRetrying(false);
        return;
      }

      toast.success("Analyse relancée !", {
        id: "retry-analysis",
        description: "L'analyse est en cours, veuillez patienter...",
      });

      // Recharger l'analyse après 3 secondes
      setTimeout(async () => {
        const fetchResponse = await fetch(`/api/analysis/${id}`);
        const fetchData = await fetchResponse.json();
        if (fetchData.success) {
          setAnalysis(fetchData.analysis);
        }
        setIsRetrying(false);
      }, 3000);
    } catch (error) {
      console.error("Error retrying analysis:", error);
      toast.error("Erreur", {
        id: "retry-analysis",
        description: "Une erreur est survenue lors de la relance",
      });
      setIsRetrying(false);
    }
  };

  // Si payé mais analyse pas encore terminée (webhook en cours) ET pas d'erreur
  if (analysis.isPaid && !analysis.result && !analysis.error) {
    const elapsedSeconds = analysisStartTime 
      ? Math.floor((Date.now() - analysisStartTime) / 1000) 
      : 0;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-full animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Analyse en cours...</h2>
          <p className="text-gray-600 mb-2">
            Votre devis est en train d'être analysé par l'IA
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Cela peut prendre entre 10 et 30 secondes
          </p>

          {/* Compteur de temps */}
          {elapsedSeconds > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Temps écoulé</p>
              <p className="text-lg font-semibold text-gray-900">
                {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
              </p>
            </div>
          )}

          {/* Bouton de rechargement manuel */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              setPollingAttempts(0);
              const response = await fetch(`/api/analysis/${id}`);
              const data = await response.json();
              if (data.success) {
                setAnalysis(data.analysis);
                if (data.analysis.result || data.analysis.error) {
                  // L'analyse est terminée, le useEffect se chargera de mettre à jour
                  window.location.reload();
                }
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
            <span>Recharger</span>
          </motion.button>

          {/* Message si ça prend trop de temps */}
          {elapsedSeconds > 60 && (
            <p className="mt-4 text-xs text-gray-500">
              L'analyse prend plus de temps que prévu. Si cela persiste, contactez le support.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si payé mais erreur d'analyse
  if (analysis.isPaid && analysis.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur d'analyse</h2>
          <p className="text-gray-600 mb-2">
            L'analyse de votre devis a échoué.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Type d'erreur : {analysis.error.type}
            <br />
            {analysis.error.message}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetryAnalysis}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRetrying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Relance en cours...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
                <span>Réessayer l'analyse</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className="mt-4 block w-full text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            Retour à l'accueil
          </motion.button>
        </div>
      </div>
    );
  }

  // Show paywall if not paid
  if (showPaywall && !analysis.isPaid) {
    // Si l'analyse n'est pas encore faite, utiliser des valeurs mock pour l'aperçu
    const previewScore = analysis.result?.trust_score ?? 75; // Score estimé par défaut
    const totalSavings = analysis.result 
      ? calculateTotalSavings() 
      : 250; // Économies estimées par défaut
    
    // Calculer le prix en fonction de la catégorie
    const pricing = getPricingForCategory(analysis.category);
    
    return (
      <Paywall 
        analysisId={id}
        previewScore={previewScore}
        previewSavings={Math.round(totalSavings)}
        priceLabel={pricing.label}
      />
    );
  }


  // À ce stade, l'analyse doit être payée ET avoir un résultat
  if (!analysis || !analysis.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  // TypeScript sait maintenant que result existe (non-null assertion après vérification)
  const result = analysis.result!;
  const totalSavings = calculateTotalSavings();

  return renderReport(result, totalSavings, id, false);
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="py-5 px-6 border-b border-gray-200 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                VigiDevis
              </h1>
              <p className="text-xs text-gray-500">Rapport #{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast.info("Fonctionnalité bientôt disponible")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm shadow-sm hover:bg-emerald-100 transition-colors"
            >
              <Share2 className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Partager</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-lg hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Accueil</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Card - Score + Économies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-3xl bg-white border-2 border-gray-200 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Score */}
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                Score de Confiance
              </p>
              <CircularScore score={result.trust_score} />
            </div>

            {/* Right: Économies */}
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Économie Potentielle
              </p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-3">
                  <span className="text-6xl md:text-7xl font-black text-red-600">
                    {totalSavings.toFixed(0)}€
                  </span>
                </div>
                <p className="text-gray-600 text-lg">
                  En négociant selon nos recommandations
                </p>
              </motion.div>

              {/* Category */}
              <div className="mt-6">
                <span className="inline-block px-4 py-2 rounded-full bg-gray-900 text-white font-semibold text-sm">
                  {result.category}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Partagez votre économie !</h3>
              <p className="text-sm text-gray-600">Aidez vos proches à éviter les arnaques</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => shareAnalysis("whatsapp", totalSavings)}
                className="px-4 py-2 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20BA5A] transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={() => shareAnalysis("twitter", totalSavings)}
                className="px-4 py-2 rounded-xl bg-[#1DA1F2] text-white font-semibold text-sm hover:bg-[#1A8CD8] transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => shareAnalysis("email", totalSavings)}
                className="px-4 py-2 rounded-xl bg-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Email
              </button>
            </div>
          </div>
        </motion.div>

        {/* Verdict */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg shadow-blue-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Notre Verdict
            </h2>
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">{result.verdict}</p>
        </motion.div>

        {/* Line Items Table */}
        {result.line_items && result.line_items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analyse Détaillée Ligne par Ligne
              </h2>
            </div>
            <div className="grid gap-4">
              {result.line_items.map((item, index) => (
                <LineItemCard key={index} item={item} index={index} />
              ))}
            </div>

            {/* Sources */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-gray-500 text-center flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" strokeWidth={2} />
              <span>Analyse basée sur les données en temps réel : <span className="font-semibold">Amazon</span>, <span className="font-semibold">Oscaro</span>, et <span className="font-semibold">tarifs conventionnés 2024</span></span>
            </motion.p>
          </motion.div>
        )}

        {/* Points d'Attention */}
        {result.red_flags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 shadow-lg shadow-red-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Points d'Attention
              </h2>
            </div>
            <ul className="space-y-3">
              {result.red_flags.map((flag, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 text-red-900"
                >
                  <span className="font-bold text-red-600 mt-1">•</span>
                  <span className="font-medium">{flag}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Stratégie de Négociation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Lightbulb className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Votre Message de Négociation</h2>
                <p className="text-emerald-100 text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" strokeWidth={2} />
                  Prêt à envoyer par SMS ou email
                </p>
              </div>
            </div>
            
            <div className="bg-white text-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
              <p className="text-base leading-relaxed whitespace-pre-line">
                {result.negotiation_tip}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 font-bold transition-all hover:scale-105"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" strokeWidth={2.5} />
                    <span>Copier le message</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  const smsBody = encodeURIComponent(result.negotiation_tip);
                  window.open(`sms:?&body=${smsBody}`, '_blank');
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 hover:bg-white/90 font-bold transition-all hover:scale-105 shadow-lg"
              >
                <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
                <span>Envoyer par SMS</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Prix Juste */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-lg shadow-emerald-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Prix Juste Estimé
            </h3>
          </div>
          <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {result.fair_price_estimate}
          </p>
          <p className="text-gray-600">
            Fourchette basée sur les prix du marché actuel
          </p>
        </motion.div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              router.push("/");
            }}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
          >
            <RefreshCcw className="w-6 h-6" strokeWidth={2.5} />
            <span>Analyser un autre devis</span>
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}

export default function RapportPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre rapport...</p>
          </div>
        </div>
      }
    >
      <RapportContent />
    </Suspense>
  );
}

