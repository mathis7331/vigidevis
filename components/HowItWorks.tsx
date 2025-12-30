"use client";

import { motion } from "framer-motion";
import { Upload, ScanSearch, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Uploadez votre devis",
    description: "Prenez en photo ou uploadez votre devis en quelques secondes",
  },
  {
    icon: ScanSearch,
    title: "L'IA analyse ligne par ligne",
    description: "Notre intelligence artificielle compare chaque prix avec le marché",
  },
  {
    icon: CheckCircle2,
    title: "Décidez en toute confiance",
    description: "Recevez un verdict détaillé et des conseils de négociation",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600">
            Une analyse complète en 3 étapes simples
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  {/* Number Badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Icon Container */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-wrap justify-center items-center gap-8 px-8 py-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-gray-900">100% Confidentiel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ScanSearch className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-gray-900">Analyse en 3 secondes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">+10 000 utilisateurs</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
