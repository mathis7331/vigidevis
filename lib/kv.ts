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

// Détection intelligente : sur Vercel, on utilise toujours Vercel KV
// @vercel/kv détecte automatiquement les variables configurées dans Vercel Dashboard
// En local, on utilise le mock si les variables ne sont pas configurées
const isVercel = !!process.env.VERCEL;
const hasKVEnvVars = 
  !!(process.env.VERCEL_KV_REST_API_URL || process.env.KV_REST_API_URL) && 
  !!(process.env.VERCEL_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN);

// Sur Vercel, on utilise toujours Vercel KV (même si les variables ne sont pas dans process.env)
// En local, on utilise Vercel KV seulement si les variables sont configurées
const shouldUseVercelKV = isVercel || hasKVEnvVars;

// Log du mode utilisé (seulement au démarrage)
if (typeof window === 'undefined') { // Server-side only
  if (shouldUseVercelKV) {
    console.log(`[KV] Using Vercel KV (${isVercel ? 'Vercel production' : 'local with env vars'})`);
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
  try {
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
    console.log(`[VERCEL KV] ✅ Saved pending analysis ${id} (category: ${category || 'none'})`);
  } catch (error) {
    console.error(`[VERCEL KV] ❌ Error saving pending analysis ${id}:`, error);
    throw error;
  }
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
  try {
    const { kv } = await import("@vercel/kv");
    const analysis = await kv.get<StoredAnalysis>(`analysis:${id}`);
    if (analysis) {
      console.log(`[VERCEL KV] ✅ Retrieved analysis ${id}: isPaid=${analysis.isPaid}, hasResult=${!!analysis.result}`);
    } else {
      console.log(`[VERCEL KV] ⚠️ Analysis ${id} not found in KV store`);
    }
    return analysis;
  } catch (error) {
    console.error(`[VERCEL KV] ❌ Error retrieving analysis ${id}:`, error);
    throw error;
  }
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

// Helper pour essayer Vercel KV avec fallback vers mock
async function tryVercelKV<T>(
  vercelFn: () => Promise<T>,
  mockFn: () => Promise<T>,
  operation: string
): Promise<T> {
  if (!shouldUseVercelKV) {
    return mockFn();
  }
  
  try {
    return await vercelFn();
  } catch (error) {
    console.error(`[KV] Error using Vercel KV for ${operation}, falling back to mock:`, error);
    return mockFn();
  }
}

// Exports conditionnels : utilise Vercel KV si configuré, sinon mock
export async function savePendingAnalysis(
  id: string,
  imageBase64: string,
  category?: string
): Promise<void> {
  return tryVercelKV(
    () => savePendingAnalysisVercel(id, imageBase64, category),
    () => mockKV.savePendingAnalysis(id, imageBase64, category),
    `savePendingAnalysis(${id})`
  );
}

export async function saveAnalysis(
  id: string,
  result: AnalysisResult,
  isPaid: boolean = false,
  category?: string
): Promise<void> {
  return tryVercelKV(
    () => saveAnalysisVercel(id, result, isPaid, category),
    () => mockKV.saveAnalysis(id, result, isPaid, category),
    `saveAnalysis(${id})`
  );
}

export async function getAnalysis(id: string): Promise<StoredAnalysis | null> {
  return tryVercelKV(
    () => getAnalysisVercel(id),
    () => mockKV.getAnalysis(id),
    `getAnalysis(${id})`
  );
}

export async function markAnalysisAsPaid(id: string): Promise<boolean> {
  return tryVercelKV(
    () => markAnalysisAsPaidVercel(id),
    () => mockKV.markAnalysisAsPaid(id),
    `markAnalysisAsPaid(${id})`
  );
}

export async function incrementStats(type: "analyses" | "savings", value: number = 1): Promise<void> {
  return tryVercelKV(
    () => incrementStatsVercel(type, value),
    () => mockKV.incrementStats(type, value),
    `incrementStats(${type})`
  );
}

export async function getStats(): Promise<{ analyses: number; savings: number }> {
  return tryVercelKV(
    () => getStatsVercel(),
    () => mockKV.getStats(),
    'getStats()'
  );
}
