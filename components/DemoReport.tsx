"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageSquare, Share2, Car, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { CircularScore } from "@/components/CircularScore";
import { LineItemCard } from "@/components/LineItemCard";
import { AnalysisResult } from "@/lib/types";
import { toast } from "sonner";

interface DemoReportProps {
  onConvert: () => void;
  onRedirect?: () => void;
}

// Données de démonstration pour vêtement Vinted
const demoAnalysis: AnalysisResult = {
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

export function DemoReport({ onConvert, onRedirect }: DemoReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullContent = `${demoAnalysis.sales_copy.seo_title}\n\n${demoAnalysis.sales_copy.description}\n\n${demoAnalysis.sales_copy.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast.success("Annonce copiée !", { description: "Prête à coller dans Vinted." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSMS = () => {
    const smsText = `sms:?body=${encodeURIComponent("Regarde cette annonce Vinted générée par IA !")}`;
    window.location.href = smsText;
  };

  // Pour les vêtements, on retourne simplement la valeur marchande
  const getItemValue = () => {
    return demoAnalysis.pricing.market_price;
  };

  const totalSavings = getItemValue();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header avec ID de démonstration */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium text-sm mb-4">
          <Car className="w-4 h-4" strokeWidth={2.5} />
          <span>Rapport de démonstration #DEMO12345</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Analyse de votre devis
        </h1>
        <p className="text-gray-600">{demoAnalysis.item_analysis.type}</p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
      >
        <div className="flex flex-col items-center">
          {/* État du vêtement */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-text mb-2">
              {demoAnalysis.item_analysis.brand} {demoAnalysis.item_analysis.type}
            </div>
            <div className="text-lg text-gray-600">
              État: {demoAnalysis.item_analysis.condition_score}/10
            </div>
          </div>

          {/* Valeur marchande */}
          <div className="mt-6 space-y-3 w-full max-w-md">
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="px-6 py-3 rounded-full font-black text-base bg-gradient-to-r from-primary via-primary to-accent text-white shadow-xl"
              >
                💰 VALEUR MARCHANDE
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Prix recommandé :
              </p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl font-black text-primary drop-shadow-lg"
              >
                {getItemValue()}€
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description générée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <div>
            <h3 className="font-bold text-lg text-text mb-2">Description optimisée</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{demoAnalysis.sales_copy.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Hashtags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 border-2 border-secondary/30"
      >
        <div className="flex items-center gap-3 mb-3">
          <TrendingDown className="w-6 h-6 text-text" strokeWidth={2.5} />
          <h3 className="font-bold text-lg text-text">Hashtags optimisés</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {demoAnalysis.sales_copy.hashtags.slice(0, 10).map((hashtag, index) => (
            <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
              {hashtag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stratégies de prix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border-2 border-accent/20 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-text mb-4">💰 Stratégies de prix</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="text-sm text-red-600 font-semibold mb-1">VENTE RAPIDE</div>
            <div className="text-2xl font-black text-red-600">{demoAnalysis.pricing.fast_sell_price}€</div>
            <div className="text-xs text-red-500 mt-1">24h max</div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/30">
            <div className="text-sm text-primary font-semibold mb-1">PRIX MARCHÉ</div>
            <div className="text-2xl font-black text-primary">{demoAnalysis.pricing.market_price}€</div>
            <div className="text-xs text-primary/70 mt-1">Équitable</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-xl border border-accent/30">
            <div className="text-sm text-accent font-semibold mb-1">NÉGOCIATION</div>
            <div className="text-2xl font-black text-accent">{demoAnalysis.pricing.pro_negotiation_price}€</div>
            <div className="text-xs text-accent/70 mt-1">À discuter</div>
          </div>
        </div>
      </motion.div>

      {/* Message de négociation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          <h3 className="font-bold text-xl text-gray-900">Astuces Vinted</h3>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <p className="text-gray-700 leading-relaxed text-sm">
            💡 <strong>Conseil :</strong> Utilisez toujours le prix de vente rapide (15€) pour écouler votre article en 24h maximum !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors"
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
          </motion.button>

          <motion.button
            onClick={handleSMS}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold shadow-lg transition-colors"
          >
            <Share2 className="w-5 h-5" strokeWidth={2.5} />
            <span>Envoyer par SMS</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Bouton de conversion final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4 pt-6 border-t border-gray-200"
      >
        <p className="text-lg sm:text-xl font-bold text-gray-900 px-2">
          T'as vu l'exemple ? À ton tour maintenant !
        </p>
        <motion.button
          onClick={onConvert}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg shadow-lg transition-colors max-w-sm mx-auto"
        >
          <span>Scanner mon devis</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  );
}

