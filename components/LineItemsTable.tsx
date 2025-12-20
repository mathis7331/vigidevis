"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { LineItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LineItemsTableProps {
  items: LineItem[];
}

export function LineItemsTable({ items }: LineItemsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" strokeWidth={2.5} />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-emerald-50 border-emerald-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "danger":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const calculateSavings = (quoted: string, market: string) => {
    const quotedNum = parseFloat(quoted.replace(/[^\d.,]/g, "").replace(",", "."));
    const marketNum = parseFloat(market.replace(/[^\d.,]/g, "").replace(",", "."));
    
    if (isNaN(quotedNum) || isNaN(marketNum)) return null;
    
    const savings = quotedNum - marketNum;
    return savings > 0 ? savings : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Détail des coûts
        </h3>
        <div className="text-sm text-gray-500">
          {items.length} ligne{items.length > 1 ? "s" : ""} analysée{items.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const savings = calculateSavings(item.quoted_price, item.market_price);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-2xl border-2 p-5 transition-all hover:shadow-md",
                getStatusColor(item.status)
              )}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Item Name */}
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">
                    {item.item_name}
                  </h4>

                  {/* Prices Comparison */}
                  <div className="flex flex-wrap items-baseline gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Prix du devis</span>
                      <span className={cn(
                        "text-2xl font-bold",
                        item.status === "danger" ? "text-red-600" : 
                        item.status === "warning" ? "text-orange-600" : 
                        "text-gray-900"
                      )}>
                        {item.quoted_price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Prix du marché</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {item.market_price}
                      </span>
                    </div>

                    {/* Savings Badge */}
                    {savings && savings > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold shadow-lg"
                      >
                        <TrendingDown className="w-5 h-5" strokeWidth={2.5} />
                        <span>-{savings.toFixed(0)}€</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Comment */}
                  <div className={cn(
                    "text-sm font-medium px-4 py-2 rounded-xl inline-block",
                    item.status === "danger" ? "bg-red-100 text-red-700" :
                    item.status === "warning" ? "bg-orange-100 text-orange-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {item.comment}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total Savings Summary */}
      {items.some(item => calculateSavings(item.quoted_price, item.market_price)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: items.length * 0.1 }}
          className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90 mb-1">
                Économie potentielle totale
              </div>
              <div className="text-4xl font-bold">
                {items.reduce((total, item) => {
                  const savings = calculateSavings(item.quoted_price, item.market_price);
                  return total + (savings || 0);
                }, 0).toFixed(0)}€
              </div>
            </div>
            <TrendingDown className="w-16 h-16 opacity-30" strokeWidth={2} />
          </div>
        </motion.div>
      )}
    </div>
  );
}





