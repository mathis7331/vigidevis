"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingDown, Lightbulb } from "lucide-react";
import { LineItem } from "@/lib/types";

interface LineItemCardProps {
  item: LineItem;
  index: number;
}

export function LineItemCard({ item, index }: LineItemCardProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case "ok":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" strokeWidth={2.5} />;
      case "danger":
        return <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2.5} />;
    }
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case "ok":
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
            Prix Juste
          </span>
        );
      case "warning":
        return (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
            À Surveiller
          </span>
        );
      case "danger":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
            Trop Cher
          </span>
        );
    }
  };

  const calculateSavings = () => {
    const quotedNum = parseFloat(item.quoted_price.replace(/[^\d.,]/g, "").replace(",", "."));
    const marketNum = parseFloat(item.market_price.replace(/[^\d.,]/g, "").replace(",", "."));
    
    if (isNaN(quotedNum) || isNaN(marketNum)) return null;
    
    const savings = quotedNum - marketNum;
    return savings > 0 ? savings : null;
  };

  const savings = calculateSavings();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 transition-all"
    >
      {/* Header: Name + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <h3 className="font-bold text-lg text-gray-900">{item.item_name}</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Price comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Quoted price */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Prix du devis</p>
          <p className={`text-2xl font-bold ${
            item.status === "danger" ? "text-red-600" :
            item.status === "warning" ? "text-orange-600" :
            "text-gray-900"
          }`}>
            {item.quoted_price}
          </p>
        </div>

        {/* Market price */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Prix du marché</p>
          <p className="text-2xl font-bold text-emerald-600">
            {item.market_price}
          </p>
        </div>
      </div>

      {/* Savings indicator */}
      {savings && savings > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <TrendingDown className="w-5 h-5 text-red-600" strokeWidth={2.5} />
          <span className="font-bold text-red-600">
            Écart: -{savings.toFixed(0)}€
          </span>
        </div>
      )}

      {/* Comment */}
      <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-700 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
          <span className="font-medium">{item.comment}</span>
        </p>
      </div>
    </motion.div>
  );
}

