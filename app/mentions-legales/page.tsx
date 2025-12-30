"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function MentionsLegalesPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-700 font-medium mb-6 text-sm">
              <FileText className="w-4 h-4" strokeWidth={2.5} />
              <span>Informations Légales</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Mentions Légales
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
            {/* Éditeur */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur du site</h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Le site VINTED-TURBO est édité par VINTED-TURBO.
              </p>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-2">
                <strong>Email :</strong>{" "}
                <a 
                  href="mailto:d64171808@gmail.com" 
                  className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                >
                  d64171808@gmail.com
                </a>
              </p>
            </div>

            {/* Hébergement */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hébergement</h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Le site est hébergé par Vercel Inc.
              </p>
            </div>

            {/* Propriété intellectuelle */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                L'ensemble du contenu de ce site (textes, images, logos, etc.) est la propriété exclusive de VINTED-TURBO et est protégé par les lois relatives à la propriété intellectuelle.
              </p>
            </div>
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

