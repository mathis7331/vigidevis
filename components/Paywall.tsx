"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Shield, Zap, TrendingDown, Lightbulb, CreditCard, Trash2, RotateCcw } from "lucide-react";
import { createCheckoutSession } from "@/actions/create-checkout";
import { toast } from "sonner";

interface PaywallProps {
  analysisId: string;
  previewScore: number;
  previewSavings: number;
  priceLabel: string; // Prix formaté (ex: "14,90€" ou "24,90€")
}

export function Paywall({ analysisId, previewScore, previewSavings, priceLabel }: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    toast.loading("Redirection vers le paiement...");

    try {
      const { success, sessionUrl, error } = await createCheckoutSession(analysisId);

      if (!success || !sessionUrl) {
        toast.error("Erreur", { description: error || "Impossible de créer la session" });
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout using the session URL
      toast.dismiss();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Erreur", { description: "Une erreur est survenue" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Preview Card */}
        <div className="mb-8 p-8 rounded-3xl bg-white border-2 border-gray-200 shadow-xl relative overflow-hidden">
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-gray-600 font-semibold">Analyse verrouillée</p>
            </div>
          </div>

          {/* Blurred content */}
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Score Preview */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Score de Confiance
                </p>
                <div className="text-7xl font-black text-gray-300">
                  {previewScore}
                </div>
                <p className="text-gray-400 mt-2">/100</p>
              </div>

              {/* Savings Preview */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Économie Potentielle
                </p>
                <div className="text-7xl font-black text-gray-300">
                  {previewSavings}€
                </div>
                <p className="text-gray-400 mt-2">Détectés par l'IA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paywall Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
              >
                <Zap className="w-10 h-10 text-white" strokeWidth={2.5} fill="currentColor" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Débloquez l'analyse complète
              </h2>
              <p className="text-emerald-50 text-lg">
                L'IA a détecté <span className="font-bold text-2xl text-white">{previewSavings}€</span> d'économies potentielles
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Check className="w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="font-bold mb-1">Analyse ligne par ligne</p>
                  <p className="text-sm text-emerald-100">
                    Chaque prestation comparée au marché
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Lightbulb className="w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold mb-1">Arguments de négociation</p>
                  <p className="text-sm text-emerald-100">
                    Message prêt à envoyer par SMS
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <TrendingDown className="w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold mb-1">Prix marché en temps réel</p>
                  <p className="text-sm text-emerald-100">
                    Amazon, Oscaro, tarifs 2024
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold mb-1">Garantie remboursé</p>
                  <p className="text-sm text-emerald-100">
                    Si score ≥ 90/100 (devis déjà juste)
                  </p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="inline-block p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30">
                <p className="text-sm text-emerald-100 mb-2">Prix unique</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black">{priceLabel}</span>
                </div>
                <p className="text-sm text-emerald-100 mt-2">
                  Sans abonnement • Rapport accessible 30 jours
                </p>
              </div>
            </div>

            {/* Bloc de réassurance avant paiement */}
            <div className="mb-8 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-white">100% Confidentiel</p>
                    <p className="text-xs text-emerald-100">Aucune donnée transmise</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Suppression auto</p>
                    <p className="text-xs text-emerald-100">Devis supprimé après analyse</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Remboursé</p>
                    <p className="text-xs text-emerald-100">Si le prix est déjà juste</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleUnlock}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-emerald-600 font-bold text-xl shadow-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" strokeWidth={2.5} />
                  <span>Débloquer pour {priceLabel}</span>
                </>
              )}
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={2} />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>Cryptage SSL</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mt-6 text-sm"
        >
          💡 <span className="font-semibold">Astuce :</span> Si l'analyse révèle que votre devis est déjà au prix juste (score ≥ 90/100), nous ne vous facturons pas.
        </motion.p>
      </motion.div>
    </div>
  );
}


