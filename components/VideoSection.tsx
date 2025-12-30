"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VideoSectionProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
}

export function VideoSection({ 
  videoUrl, 
  posterUrl = "/video-poster.jpg", 
  title = "Nos témoignages" 
}: VideoSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-12 mb-16"
    >
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
        {title}
      </h2>

      {/* Video Container */}
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl shadow-lg overflow-hidden bg-gray-100 group">
          {/* 16:9 Aspect Ratio */}
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <video
              className="absolute inset-0 w-full h-full object-cover"
              controls
              preload="none"
              poster={posterUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/quicktime" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>

            {/* Play Icon Overlay (visible avant le play) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <Play className="w-10 h-10 text-white ml-1" strokeWidth={2.5} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-4"
        >
          🎥 Découvrez comment VINTED-TURBO optimise vos annonces en quelques secondes
        </motion.p>
      </div>
    </motion.div>
  );
}

