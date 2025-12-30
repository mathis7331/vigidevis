"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageSquare, Share2, Car, TrendingDown, AlertTriangle } from "lucide-react";
import { CircularScore } from "@/components/CircularScore";
import { LineItemCard } from "@/components/LineItemCard";
import { AnalysisResult } from "@/lib/types";
import { toast } from "sonner";

interface DemoReportProps {
  onConvert: () => void;
  onRedirect?: () => void;
}

// Données de démonstration pour Mécanique Auto
const demoAnalysis: AnalysisResult = {
  category: "Mécanique Auto",
  trust_score: 65,
  verdict: "Votre garagiste surfacture plusieurs pièces. Les plaquettes de frein sont vendues 3x le prix du marché. Vous pouvez économiser jusqu'à 175€ en négociant.",
  red_flags: [
    "Plaquettes de frein avant : 3x le prix Oscaro",
    "Main d'œuvre excessive sur certaines prestations"
  ],
  fair_price_estimate: "240€ - 280€",
  negotiation_tip: `Bonjour,

J'ai bien reçu votre devis pour la réparation de ma voiture. En comparant avec les prix du marché (Oscaro, Amazon, garages partenaires), j'ai remarqué que certaines pièces sont facturées bien au-dessus des tarifs habituels.

Par exemple, les plaquettes de frein avant sont proposées à 180€ alors qu'elles sont disponibles à 60€ sur Oscaro pour la même référence.

Je souhaiterais discuter avec vous pour ajuster ces prix et trouver un terrain d'entente qui soit équitable pour nous deux.

Cordialement`,
  line_items: [
    {
      item_name: "Plaquettes de frein avant",
      quoted_price: "180€",
      market_price: "60€",
      status: "danger",
      comment: "3x le prix Oscaro/Amazon"
    },
    {
      item_name: "Main d'œuvre (2h)",
      quoted_price: "120€",
      market_price: "80€",
      status: "warning",
      comment: "Tarif horaire supérieur à la moyenne"
    },
    {
      item_name: "Liquide de frein",
      quoted_price: "25€",
      market_price: "15€",
      status: "warning",
      comment: "Prix légèrement élevé"
    },
    {
      item_name: "Diagnostic électronique",
      quoted_price: "45€",
      market_price: "40€",
      status: "ok",
      comment: "Prix conforme au marché"
    }
  ]
};

export function DemoReport({ onConvert, onRedirect }: DemoReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(demoAnalysis.negotiation_tip);
    setCopied(true);
    toast.success("Message copié !", { description: "Vous pouvez maintenant le coller dans votre SMS ou email." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSMS = () => {
    const smsText = `sms:?body=${encodeURIComponent(demoAnalysis.negotiation_tip)}`;
    window.location.href = smsText;
  };

  const calculateTotalSavings = () => {
    return demoAnalysis.line_items.reduce((total, item) => {
      const quoted = parseFloat(item.quoted_price.replace(/[^\d.,]/g, "").replace(",", "."));
      const market = parseFloat(item.market_price.replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(quoted) && !isNaN(market) && quoted > market) {
        return total + (quoted - market);
      }
      return total;
    }, 0);
  };

  const totalSavings = calculateTotalSavings();

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
        <p className="text-gray-600">{demoAnalysis.category}</p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
      >
        <div className="flex flex-col items-center">
          <CircularScore score={demoAnalysis.trust_score} />
          
          {/* Badge et économie */}
          <div className="mt-6 space-y-3 w-full max-w-md">
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="px-6 py-3 rounded-full font-black text-base bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-gray-900 shadow-xl border-2 border-orange-300"
              >
                ⚠️ À NÉGOCIER
              </motion.div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Économie potentielle :
              </p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl font-black text-red-600 drop-shadow-lg"
              >
                {totalSavings}€
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Verdict</h3>
            <p className="text-gray-700 leading-relaxed">{demoAnalysis.verdict}</p>
          </div>
        </div>
      </motion.div>

      {/* Estimation globale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <TrendingDown className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
          <h3 className="font-bold text-lg text-gray-900">Prix Juste Estimé</h3>
        </div>
        <p className="text-2xl font-black text-emerald-600">{demoAnalysis.fair_price_estimate}</p>
      </motion.div>

      {/* Détails par ligne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails par ligne</h2>
        {demoAnalysis.line_items.map((item, index) => (
          <LineItemCard key={index} item={item} index={index} />
        ))}
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
          <h3 className="font-bold text-xl text-gray-900">Votre Message de Négociation</h3>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
            {demoAnalysis.negotiation_tip}
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

