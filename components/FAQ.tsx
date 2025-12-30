"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Est-ce que ça marche pour les chaussures ?",
    answer: "Oui ! L'IA analyse tous types de vêtements et accessoires : chaussures, sacs, vêtements, bijoux... Elle identifie la marque, l'état et estime la valeur marchande pour optimiser ta vente."
  },
  {
    question: "Comment l'IA connaît le prix ?",
    answer: "Notre IA est entraînée sur des milliers d'annonces Vinted réussies. Elle analyse la marque, l'époque, l'état et les tendances actuelles pour te proposer le prix optimal qui maximise tes chances de vente rapide."
  },
  {
    question: "Est-ce que c'est lié à mon compte Vinted ?",
    answer: "Non, VINTED-TURBO est totalement indépendant de Vinted. On génère juste l'annonce optimisée que tu copies-colles toi-même. Aucune connexion à ton compte, 100% privé et sécurisé."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium mb-6 text-sm">
            <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
            <span>Questions Fréquentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vous avez des questions ?
          </h2>
          <p className="text-lg text-gray-600">
            Trouvez rapidement les réponses à vos interrogations
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="font-semibold text-gray-900 text-base md:text-lg pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



