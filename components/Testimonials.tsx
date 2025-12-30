"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  savings: number;
  category: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah",
    savings: 45,
    category: "vêtements",
    avatar: "S"
  },
  {
    name: "Thomas",
    savings: 80,
    category: "sneakers",
    avatar: "T"
  },
  {
    name: "Léa",
    savings: 200,
    category: "dressing",
    avatar: "L"
  }
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ils ont vendu plus cher grâce à VINTED-TURBO
          </h2>
          <p className="text-lg text-gray-600">
            Rejoignez les milliers d'utilisateurs satisfaits
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Quote Icon */}
              <div className="flex items-start justify-between mb-4">
                <Quote className="w-8 h-8 text-emerald-500 opacity-50" strokeWidth={1.5} />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" strokeWidth={0} />
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                <span className="font-semibold text-gray-900">{testimonial.name}</span> a vendu{" "}
                <span className="font-bold text-primary">{testimonial.savings}€</span> de{" "}
                {testimonial.category} grâce aux descriptions optimisées.
              </p>

              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">Utilisateur vérifié</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}












