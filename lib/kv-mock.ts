/**
 * Mock KV Store for Development
 * Use this instead of @vercel/kv when you don't have KV configured yet
 */

import { AnalysisResult } from "./types";

export interface StoredAnalysis {
  id: string;
  result?: AnalysisResult; // Optionnel : null si analyse pas encore faite
  imageBase64?: string; // Image en base64 pour analyse future
  isPaid: boolean;
  createdAt: string;
  category?: string;
  imageUrl?: string;
  error?: {
    type: string; // "IA_FAILED", "PARSING_FAILED", etc.
    message: string;
    timestamp: string;
  };
}

// In-memory storage (will reset on server restart)
// Use global to persist across HMR in development
const globalForStorage = globalThis as unknown as {
  storage: Map<string, StoredAnalysis> | undefined;
  statsAnalyses: number | undefined;
  statsSavings: number | undefined;
};

const storage = globalForStorage.storage ?? new Map<string, StoredAnalysis>();
let statsAnalyses = globalForStorage.statsAnalyses ?? 200; // Start with fake stats
let statsSavings = globalForStorage.statsSavings ?? 26700;

if (process.env.NODE_ENV !== "production") {
  globalForStorage.storage = storage;
  globalForStorage.statsAnalyses = statsAnalyses;
  globalForStorage.statsSavings = statsSavings;
}

// Demo analysis for the "Voir un exemple" button
const DEMO_ANALYSIS: StoredAnalysis = {
  id: "DEMO12345",
  isPaid: true, // Demo is always unlocked
  createdAt: new Date().toISOString(),
  category: "Mécanique Auto",
  result: {
    category: "Mécanique Auto",
    trust_score: 65,
    verdict: "Votre garagiste surfacture significativement les pièces détachées. Les plaquettes de frein sont facturées 3 fois leur prix marché, et la main d'œuvre est excessive pour ce type d'intervention simple.",
    red_flags: [
      "Plaquettes de frein 3x plus chères qu'Oscaro (180€ vs 60€)",
      "Main d'œuvre excessive : 120€ pour 30 minutes de travail",
      "Aucun devis détaillé des pièces d'origine",
    ],
    fair_price_estimate: "240€ - 280€",
    negotiation_tip: "Bonjour,\n\nJ'ai bien reçu votre devis pour le changement de plaquettes de frein. Après avoir comparé avec les prix du marché actuel, j'ai remarqué que les plaquettes sont facturées 180€ alors qu'elles coûtent environ 60€ chez Oscaro pour la même référence.\n\nDe plus, la main d'œuvre de 120€ me semble élevée pour une intervention qui prend environ 30 minutes selon les standards du secteur.\n\nSeriez-vous disposé à revoir ces montants pour nous rapprocher des prix moyens du marché ? Je reste à votre disposition pour en discuter.\n\nCordialement",
    line_items: [
      {
        item_name: "Plaquettes de frein avant (jeu complet)",
        quoted_price: "180€",
        market_price: "60€",
        status: "danger",
        comment: "Prix 3x supérieur au tarif Oscaro pour la même référence"
      },
      {
        item_name: "Main d'œuvre changement plaquettes",
        quoted_price: "120€",
        market_price: "80€",
        status: "warning",
        comment: "Tarif horaire élevé pour une intervention standard de 30 minutes"
      },
      {
        item_name: "Liquide de frein (appoint)",
        quoted_price: "25€",
        market_price: "15€",
        status: "warning",
        comment: "Légèrement au-dessus du prix moyen"
      },
      {
        item_name: "Diagnostic électronique",
        quoted_price: "45€",
        market_price: "40€",
        status: "ok",
        comment: "Prix conforme aux standards du secteur"
      }
    ]
  }
};

// Initialize demo analysis
storage.set("DEMO12345", DEMO_ANALYSIS);

export async function savePendingAnalysis(
  id: string,
  imageBase64: string,
  category?: string
): Promise<void> {
  const analysis: StoredAnalysis = {
    id,
    imageBase64,
    result: undefined, // Pas encore analysé
    isPaid: false,
    createdAt: new Date().toISOString(),
    category,
  };

  storage.set(id, analysis);
  console.log(`[MOCK KV] Saved pending analysis ${id} (image only, no OpenAI call)`);
}

export async function saveAnalysis(
  id: string,
  result: AnalysisResult,
  isPaid: boolean = false,
  category?: string
): Promise<void> {
  const analysis: StoredAnalysis = {
    id,
    result,
    isPaid,
    createdAt: new Date().toISOString(),
    category,
  };

  storage.set(id, analysis);
  console.log(`[MOCK KV] Saved analysis ${id}`);
}

export async function getAnalysis(id: string): Promise<StoredAnalysis | null> {
  // Si c'est l'analyse de démo, s'assurer qu'elle existe
  if (id === "DEMO12345" && !storage.has(id)) {
    storage.set("DEMO12345", DEMO_ANALYSIS);
    console.log(`[MOCK KV] ✅ Created demo analysis ${id}`);
  }
  
  const analysis = storage.get(id) || null;
  console.log(`[MOCK KV] Retrieved analysis ${id}:`, analysis ? "found" : "not found");
  return analysis;
}

export async function markAnalysisAsPaid(id: string): Promise<boolean> {
  const analysis = storage.get(id);
  if (!analysis) return false;

  analysis.isPaid = true;
  storage.set(id, analysis);
  console.log(`[MOCK KV] Marked analysis ${id} as paid`);
  return true;
}

export async function incrementStats(type: "analyses" | "savings", value: number = 1): Promise<void> {
  if (type === "analyses") {
    statsAnalyses += value;
    if (process.env.NODE_ENV !== "production") {
      globalForStorage.statsAnalyses = statsAnalyses;
    }
    console.log(`[MOCK KV] Incremented analyses to ${statsAnalyses}`);
  } else {
    statsSavings += value;
    if (process.env.NODE_ENV !== "production") {
      globalForStorage.statsSavings = statsSavings;
    }
    console.log(`[MOCK KV] Incremented savings to ${statsSavings}€`);
  }
}

export async function getStats(): Promise<{ analyses: number; savings: number }> {
  return {
    analyses: globalForStorage.statsAnalyses ?? statsAnalyses,
    savings: globalForStorage.statsSavings ?? statsSavings,
  };
}

export async function saveAnalysisError(
  id: string,
  errorType: string,
  errorMessage: string,
  isPaid: boolean = true
): Promise<void> {
  const existing = storage.get(id);
  
  const analysis: StoredAnalysis = {
    id,
    isPaid,
    createdAt: existing?.createdAt || new Date().toISOString(),
    category: existing?.category,
    imageBase64: existing?.imageBase64, // Conserver l'image pour retry
    error: {
      type: errorType,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    },
  };
  
  storage.set(id, analysis);
  console.log(`[MOCK KV] ✅ Saved error for analysis ${id}: ${errorType}`);
}


