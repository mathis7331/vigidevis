"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-5 px-6 border-b border-gray-100 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                VINTED-TURBO
              </h1>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium mb-6 text-sm">
              <Shield className="w-4 h-4" strokeWidth={2.5} />
              <span>Document Légal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Article 1 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  1
                </span>
                Objet
              </h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Les présentes CGV régissent la vente du service d'analyse de vêtements par intelligence artificielle sur le site VINTED-TURBO.
              </p>
            </div>

            {/* Article 2 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  2
                </span>
                Prix et Paiement
              </h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Le tarif unique est de <span className="font-bold text-emerald-600">7,99 € TTC</span> par analyse. Le paiement est sécurisé via la plateforme <span className="font-semibold">Stripe</span>.
              </p>
            </div>

            {/* Article 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  3
                </span>
                Politique de Remboursement
              </h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg mb-4">
                Conformément à notre promesse commerciale, si l'analyse produite par l'IA indique que le devis soumis est déjà "au prix juste" (score de confiance élevé sans surcoût détecté), l'utilisateur peut demander un remboursement intégral.
              </p>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                La demande doit être faite sous <span className="font-semibold">14 jours</span> via{" "}
                <a 
                  href="mailto:d64171808@gmail.com" 
                  className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                >
                  d64171808@gmail.com
                </a>.
              </p>
            </div>

            {/* Article 4 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  4
                </span>
                Droit de rétractation
              </h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                S'agissant d'un contenu numérique fourni instantanément après paiement, l'utilisateur renonce expressément à son droit de rétractation conformément à l'article <span className="font-semibold">L221-28 du Code de la consommation</span>.
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200"
          >
            <h3 className="font-bold text-gray-900 mb-2">Questions ?</h3>
            <p className="text-gray-700">
              Pour toute question concernant ces CGV, contactez-nous à{" "}
              <a 
                href="mailto:d64171808@gmail.com" 
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
              >
                d64171808@gmail.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-text">VINTED-TURBO</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 VINTED-TURBO. Fait avec ❤️ pour les étudiants à Mons.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

