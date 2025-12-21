// Détection automatique : utilise Vercel KV en production si configuré, sinon mock
import { AnalysisResult } from "./types";

export interface StoredAnalysis {
  id: string;
  result?: AnalysisResult; // Optionnel : null si analyse pas encore faite
  imageBase64?: string; // Image en base64 pour analyse future
  isPaid: boolean;
  createdAt: string;
  category?: string;
  imageUrl?: string;
}

// Vérifier si Vercel KV est configuré (variables d'environnement Vercel)
// Supporte les deux conventions : VERCEL_KV_* et KV_*
// Note: @vercel/kv détecte automatiquement les variables si configurées dans Vercel Dashboard
const isVercelKVConfigured = 
  (process.env.VERCEL_KV_REST_API_URL || process.env.KV_REST_API_URL) && 
  (process.env.VERCEL_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN);

// Log du mode utilisé (seulement au démarrage)
if (typeof window === 'undefined') { // Server-side only
  if (isVercelKVConfigured) {
    console.log('[KV] Using Vercel KV (production mode)');
  } else {
    console.log('[KV] Using mock KV store (development mode - Vercel KV not configured)');
    console.log('[KV] To use Vercel KV in production, configure KV_REST_API_URL and KV_REST_API_TOKEN in Vercel Dashboard');
  }
}

// Implémentation avec Vercel KV
async function savePendingAnalysisVercel(
  id: string,
  imageBase64: string,
  category?: string
): Promise<void> {
  const { kv } = await import("@vercel/kv");
  const analysis: StoredAnalysis = {
    id,
    imageBase64,
    result: undefined,
    isPaid: false,
    createdAt: new Date().toISOString(),
    category,
  };
  await kv.set(`analysis:${id}`, analysis, { ex: 60 * 60 * 24 * 30 });
  console.log(`[VERCEL KV] Saved pending analysis ${id}`);
}

async function saveAnalysisVercel(
  id: string,
  result: AnalysisResult,
  isPaid: boolean = false,
  category?: string
): Promise<void> {
  const { kv } = await import("@vercel/kv");
  const analysis: StoredAnalysis = {
    id,
    result,
    isPaid,
    createdAt: new Date().toISOString(),
    category,
  };
  await kv.set(`analysis:${id}`, analysis, { ex: 60 * 60 * 24 * 30 });
  console.log(`[VERCEL KV] Saved analysis ${id}`);
}

async function getAnalysisVercel(id: string): Promise<StoredAnalysis | null> {
  const { kv } = await import("@vercel/kv");
  const analysis = await kv.get(`analysis:${id}`);
  console.log(`[VERCEL KV] Retrieved analysis ${id}:`, analysis ? "found" : "not found");
  return analysis;
}

async function markAnalysisAsPaidVercel(id: string): Promise<boolean> {
  const analysis = await getAnalysisVercel(id);
  if (!analysis) return false;
  analysis.isPaid = true;
  await saveAnalysisVercel(id, analysis.result!, true, analysis.category);
  console.log(`[VERCEL KV] Marked analysis ${id} as paid`);
  return true;
}

async function incrementStatsVercel(type: "analyses" | "savings", value: number = 1): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.incrby(`stats:${type}`, value);
}

async function getStatsVercel(): Promise<{ analyses: number; savings: number }> {
  const { kv } = await import("@vercel/kv");
  const [analyses, savings] = await Promise.all([
    kv.get("stats:analyses"),
    kv.get("stats:savings"),
  ]);
  return {
    analyses: (analyses as number) || 0,
    savings: (savings as number) || 0,
  };
}

// Implémentation avec Mock KV
import * as mockKV from "./kv-mock";

// Exports conditionnels : utilise Vercel KV si configuré, sinon mock
export async function savePendingAnalysis(
  id: string,
  imageBase64: string,
  category?: string
): Promise<void> {
  if (isVercelKVConfigured) {
    return savePendingAnalysisVercel(id, imageBase64, category);
  } else {
    return mockKV.savePendingAnalysis(id, imageBase64, category);
  }
}

export async function saveAnalysis(
  id: string,
  result: AnalysisResult,
  isPaid: boolean = false,
  category?: string
): Promise<void> {
  if (isVercelKVConfigured) {
    return saveAnalysisVercel(id, result, isPaid, category);
  } else {
    return mockKV.saveAnalysis(id, result, isPaid, category);
  }
}

export async function getAnalysis(id: string): Promise<StoredAnalysis | null> {
  if (isVercelKVConfigured) {
    return getAnalysisVercel(id);
  } else {
    return mockKV.getAnalysis(id);
  }
}

export async function markAnalysisAsPaid(id: string): Promise<boolean> {
  if (isVercelKVConfigured) {
    return markAnalysisAsPaidVercel(id);
  } else {
    return mockKV.markAnalysisAsPaid(id);
  }
}

export async function incrementStats(type: "analyses" | "savings", value: number = 1): Promise<void> {
  if (isVercelKVConfigured) {
    return incrementStatsVercel(type, value);
  } else {
    return mockKV.incrementStats(type, value);
  }
}

export async function getStats(): Promise<{ analyses: number; savings: number }> {
  if (isVercelKVConfigured) {
    return getStatsVercel();
  } else {
    return mockKV.getStats();
  }
}
