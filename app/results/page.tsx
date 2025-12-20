"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { CircularScore } from "@/components/CircularScore";
import { LineItemCard } from "@/components/LineItemCard";
import { AnalysisResult } from "@/lib/types";
import { toast } from "sonner";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const calculateTotalSavings = () => {
    if (!result) return 0;
    return result.line_items.reduce((total, item) => {
      const quotedNum = parseFloat(item.quoted_price.replace(/[^\d.,]/g, "").replace(",", "."));
      const marketNum = parseFloat(item.market_price.replace(/[^\d.,]/g, "").replace(",", "."));
      
      if (isNaN(quotedNum) || isNaN(marketNum)) return total;
      
      const savings = quotedNum - marketNum;
      return total + (savings > 0 ? savings : 0);
    }, 0);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    
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

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const totalSavings = calculateTotalSavings();

  return (
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
              <p className="text-xs text-gray-500">Analyse terminée</p>
            </div>
          </div>
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
                <div className="flex items-baseline gap-2 mb-3">
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
                  📋 {result.category}
                </span>
              </div>
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
              sessionStorage.removeItem("analysisResult");
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
