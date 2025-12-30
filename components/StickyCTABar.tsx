"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, ArrowUp } from "lucide-react";

interface StickyCTABarProps {
  onScanClick: () => void;
}

export function StickyCTABar({ onScanClick }: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero section (approx 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-white border-t-2 border-gray-200 shadow-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Main CTA Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onScanClick}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-500/50"
              >
                <Scan className="w-6 h-6" strokeWidth={2.5} />
                <span>Scanner mon devis</span>
              </motion.button>

              {/* Scroll to Top Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shadow-md"
              >
                <ArrowUp className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



















