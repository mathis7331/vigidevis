"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft, Lock, Database, Clock } from "lucide-react";
import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium mb-6 text-sm">
              <Lock className="w-4 h-4" strokeWidth={2.5} />
              <span>RGPD Compliant</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Politique de Confidentialité (RGPD)
            </h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Collecte des données */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Collecte des données
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Nous collectons les fichiers de devis que vous téléchargez. Ces fichiers sont traités par une IA (<span className="font-semibold">OpenAI</span>) pour l'analyse des prix.
              </p>
            </div>

            {/* Sécurité et Anonymisation */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Sécurité et Anonymisation
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Nous nous engageons à ne stocker aucune donnée personnelle (nom, adresse, téléphone) présente sur vos devis. Notre système tente d'<span className="font-semibold text-emerald-600">anonymiser automatiquement</span> ces informations avant traitement.
              </p>
            </div>

            {/* Conservation */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Conservation
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Les devis sont conservés uniquement le temps nécessaire à la production du rapport d'analyse et à la gestion du support client.
              </p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
          >
            <h3 className="font-bold text-gray-900 mb-2">Vos droits</h3>
            <p className="text-gray-700 mb-3">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données personnelles.
            </p>
            <p className="text-gray-700">
              Pour exercer ces droits, contactez-nous à{" "}
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

