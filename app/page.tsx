"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image or Fallback Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 bg-cover bg-center bg-no-repeat">
          <Image
            src="/fond.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
            unoptimized
            onError={(e) => {
              // Hide image on error, fallback gradient will show
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>

        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

        {/* Fog/Blur en haut à droite */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,_rgba(100,150,255,0.1),_transparent_70%)] blur-3xl" />
      </div>

      {/* Top Bar */}
      <nav className="relative z-50 px-6 md:px-12 lg:px-16 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Left */}
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              ZAI AGENCY
            </h1>
          </div>

          {/* Nav Pill Center */}
          <nav className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full">
            <a href="#services" className="px-4 py-1.5 text-sm text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
              Services
            </a>
            <a href="#projets" className="px-4 py-1.5 text-sm text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
              Projets
            </a>
            <a href="#methode" className="px-4 py-1.5 text-sm text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
              Méthode
            </a>
            <a href="#contact" className="px-4 py-1.5 text-sm text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10">
              Contact
            </a>
          </nav>

          {/* Connexion Button Right */}
          <button className="px-6 py-2.5 text-sm font-medium text-white bg-black/40 backdrop-blur-xl border border-white/15 rounded-full hover:bg-black/60 hover:border-white/25 transition-all duration-200">
            Connexion
          </button>
        </div>
      </nav>

      {/* Hero Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge/Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full">
            <span className="text-xs md:text-sm text-white/80 uppercase tracking-wider font-medium">
              Building digital experiences
            </span>
          </div>

          {/* H1 Principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
            Web experiences,
            <br />
            <span className="text-white/95">designed to convert.</span>
          </h1>

          {/* Sous-texte */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Nous concevons des sites web modernes, rapides et efficaces,
            pensés pour transformer vos visiteurs en clients.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* CTA 1: Découvrir notre approche (Glass/Dark) */}
            <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full text-white font-medium text-base hover:bg-white/15 hover:border-white/25 transition-all duration-200">
              Découvrir notre approche
            </button>

            {/* CTA 2: Voir nos réalisations (White Pill) */}
            <button className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl">
              <span>Voir nos réalisations</span>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Card (Glass) */}
      <div className="relative z-50 px-6 md:px-12 lg:px-16 pb-8 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Stat 1 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  2+
                </div>
                <div className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Projets livrés
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  100%
                </div>
                <div className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Mobile-first
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  Focus
                </div>
                <div className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Conversion & clarté
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
