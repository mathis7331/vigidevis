"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
        className={cn(
        "relative border-3 border-dashed rounded-3xl p-12 transition-all cursor-pointer",
        "flex flex-col items-center justify-center gap-4",
        "min-h-[300px] md:min-h-[400px]",
        isDragging
          ? "border-primary bg-primary/10 scale-105 shadow-2xl shadow-primary/30"
          : "border-gray-300 bg-white hover:border-primary hover:bg-primary/5 hover:shadow-xl",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Animated Border Glow on Hover */}
      {!disabled && !isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl"
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Animated Icon */}
      <motion.div
        animate={
          isDragging
            ? { y: -10, scale: 1.1 }
            : {}
        }
        whileHover={
          disabled
            ? {}
            : {
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }
        }
        transition={{
          y: { duration: 0.6, repeat: isDragging ? Infinity : 0 },
          rotate: { duration: 0.4 },
        }}
        className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/40"
      >
        {/* Pulse Ring */}
        <motion.div
          animate={{
            scale: [1, 1.3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-2xl border-4 border-primary"
        />

        {isDragging ? (
          <ImageIcon className="w-12 h-12 text-white" strokeWidth={2.5} />
        ) : (
          <Upload className="w-12 h-12 text-white" strokeWidth={2.5} />
        )}
      </motion.div>

      {/* Text Content */}
      <div className="text-center relative z-10">
        <motion.h3
          animate={isDragging ? { scale: 1.05 } : {}}
          className="text-2xl font-bold text-text mb-2"
        >
          {isDragging ? "Dépose ta photo ici ! 📸" : "📸 Glisse la photo de ton vêtement ici"}
        </motion.h3>
        <p className="text-gray-600 text-lg">
          ou <span className="text-primary font-bold">clique pour parcourir</span>
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 mt-3 flex items-center justify-center gap-2"
        >
          <span>JPG, PNG (Max 10MB)</span>
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        </motion.p>
      </div>
    </motion.div>
  );
}

