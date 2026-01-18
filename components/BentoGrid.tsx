"use client";

import { motion } from "framer-motion";
import { Users, Sparkles, CreditCard, BarChart3 } from "lucide-react";
import { SpotlightCard } from "./SpotlightCard";
import { Counter } from "./Counter";

export function BentoGrid() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section id="features" className="py-24 px-6 bg-white relative bg-grid-pattern bg-vignette">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-[#111827] mb-4"
          >
            Des fonctionnalités que vous allez{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              adorer
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[#6B7280] text-lg max-w-2xl mx-auto"
          >
            Une suite complète d'outils conçus pour simplifier votre quotidien
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Carte 1 - Large (Connect with people) */}
          <motion.div
            custom={0}
            variants={cardVariants}
            className="md:col-span-2"
          >
            <SpotlightCard className="h-full">
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#111827] mb-2">
                      Connectez-vous avec les gens
                    </h3>
                    <p className="text-[#6B7280]">
                      Communiquez facilement avec votre équipe et vos clients
                    </p>
                  </div>
                </div>
                
                {/* Mockup Map/Network */}
                <div className="relative h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {/* Map pins */}
                  <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                  <div className="absolute top-16 right-12 w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                  <div className="absolute bottom-12 left-1/2 w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                    <line
                      x1="60"
                      y1="40"
                      x2="320"
                      y2="70"
                      stroke="rgb(251, 146, 60)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />
                    <line
                      x1="60"
                      y1="40"
                      x2="200"
                      y2="160"
                      stroke="rgb(251, 146, 60)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />
                    <line
                      x1="320"
                      y1="70"
                      x2="200"
                      y2="160"
                      stroke="rgb(251, 146, 60)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />
                  </svg>

                  {/* Avatar circles */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    A
                  </div>
                  <div className="absolute top-12 right-8 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    B
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    C
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Carte 2 - Small (AI Integration) */}
          <motion.div
            custom={1}
            variants={cardVariants}
          >
            <SpotlightCard className="h-full">
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] mb-2">
                      IA intégrée nativement
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      Automatisation intelligente pour gagner du temps
                    </p>
                  </div>
                </div>

                {/* Chat Mockup */}
                <div className="flex-1 flex flex-col gap-3 mt-auto">
                  <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full w-20" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full w-full" />
                      <div className="h-2 bg-gray-200 rounded-full w-3/4" />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100 ml-auto max-w-[80%]">
                    <div className="h-2 bg-orange-200 rounded-full w-16 mb-2" />
                    <div className="space-y-2">
                      <div className="h-2 bg-orange-200 rounded-full w-full" />
                      <div className="h-2 bg-orange-200 rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Carte 3 - Small (Easy Payments) */}
          <motion.div
            custom={2}
            variants={cardVariants}
          >
            <SpotlightCard className="h-full">
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <CreditCard className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] mb-2">
                      Paiements simplifiés
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      Transactions sécurisées en un clic
                    </p>
                  </div>
                </div>

                {/* Credit Card Mockup */}
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-xs opacity-80 mb-2">Carte</div>
                      <div className="text-lg font-bold">•••• •••• •••• 4242</div>
                    </div>
                    <CreditCard className="w-8 h-8 opacity-80" strokeWidth={2} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-80 mb-1">Titulaire</div>
                      <div className="text-sm font-semibold">JOHN DOE</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-80 mb-1">Expire</div>
                      <div className="text-sm font-semibold">12/25</div>
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Carte 4 - Tall (Analytics) */}
          <motion.div
            custom={3}
            variants={cardVariants}
            className="md:col-span-1 md:row-span-2"
          >
            <SpotlightCard className="h-full">
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] mb-2">
                      Analytics exceptionnels
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      Suivez vos performances en temps réel
                    </p>
                  </div>
                </div>

                {/* Bar Chart Mockup */}
                <div className="flex-1 flex flex-col justify-end gap-4">
                  <div className="flex items-end gap-3 h-48">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg" style={{ height: '60%' }} />
                      <div className="text-xs text-[#6B7280] font-medium">Lun</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg" style={{ height: '80%' }} />
                      <div className="text-xs text-[#6B7280] font-medium">Mar</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg" style={{ height: '100%' }} />
                      <div className="text-xs text-[#6B7280] font-medium">Mer</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg" style={{ height: '70%' }} />
                      <div className="text-xs text-[#6B7280] font-medium">Jeu</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg" style={{ height: '50%' }} />
                      <div className="text-xs text-[#6B7280] font-medium">Ven</div>
                    </div>
                  </div>
                  
                  {/* Stats with Counter */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl font-bold text-[#111827]"
                      >
                        <Counter to={24} suffix="%" />
                      </motion.div>
                      <div className="text-xs text-[#6B7280]">Cette semaine</div>
                    </div>
                    <div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="text-2xl font-bold text-[#111827]"
                      >
                        <Counter to={1200} />
                      </motion.div>
                      <div className="text-xs text-[#6B7280]">Utilisateurs</div>
                    </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
