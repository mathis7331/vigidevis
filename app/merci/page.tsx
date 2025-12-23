"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight, Mail, Sparkles } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");

  useEffect(() => {
    // Explosion de confettis "Wow"
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#ffffff"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.1)] text-center"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: 0.2 
          }}
          className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-emerald-200 rotate-12"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Paiement réussi ! <span className="inline-block animate-bounce">🎉</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Merci pour votre confiance. Votre devis est en cours d'analyse par notre <span className="text-emerald-600 font-semibold italic">IA haute performance</span>.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {analysisId ? (
            <Link href={`/rapport/${analysisId}`}>
              <button className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-500 rounded-2xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-xl shadow-emerald-200">
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Accéder à mon rapport
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <div className="text-sm text-slate-500">
              Redirection en cours...
            </div>
          )}

          {/* Reassurance Block */}
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <Mail className="w-4 h-4" />
            <span>Un e-mail de confirmation vous a été envoyé.</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function MerciPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-emerald-600 font-medium">Chargement de votre session...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

