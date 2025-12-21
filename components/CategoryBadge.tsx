"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CategoryBadge({ icon: Icon, label, color, bgColor, onClick, isActive }: CategoryBadgeProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl md:rounded-3xl transition-all",
        "p-4 md:p-8 aspect-square flex flex-col items-center justify-center gap-2 md:gap-4",
        "border-2 shadow-md hover:shadow-2xl",
        isActive
          ? `border-${color}-500 ${bgColor} ring-4 ring-${color}-200`
          : `border-gray-200 ${bgColor} hover:border-${color}-300`
      )}
    >
      {/* Icon Container */}
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center",
          isActive ? `bg-${color}-500` : `bg-${color}-100`
        )}
      >
        <Icon 
          className={cn(
            "w-6 h-6 md:w-10 md:h-10",
            isActive ? "text-white" : `text-${color}-600`
          )} 
          strokeWidth={2.5} 
        />
      </motion.div>

      {/* Label */}
      <div className="text-center">
        <h3 className="font-bold text-sm md:text-lg text-gray-900">
          {label}
        </h3>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mt-2 text-sm font-semibold text-${color}-600`}
          >
            ✓ Sélectionné
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
