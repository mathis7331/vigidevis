// MODE DEV : Utilise le mock KV par défaut (pas besoin de config)
// Pour passer au vrai KV, commentez la ligne suivante et décommentez le bloc ci-dessous
export * from "./kv-mock";

// MODE PRODUCTION : Décommentez tout le code ci-dessous pour utiliser le vrai Vercel KV
// et commentez la ligne "export * from './kv-mock'" ci-dessus
/*
import { kv } from "@vercel/kv";
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
  await kv.set(`analysis:${id}`, analysis, { ex: 60 * 60 * 24 * 30 });
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
  await kv.set(`analysis:${id}`, analysis, { ex: 60 * 60 * 24 * 30 });
}

export async function getAnalysis(id: string): Promise<StoredAnalysis | null> {
  return await kv.get(`analysis:${id}`);
}

export async function markAnalysisAsPaid(id: string): Promise<boolean> {
  const analysis = await getAnalysis(id);
  if (!analysis) return false;
  analysis.isPaid = true;
  await saveAnalysis(id, analysis.result, true, analysis.category);
  return true;
}

export async function incrementStats(type: "analyses" | "savings", value: number = 1): Promise<void> {
  await kv.incrby(`stats:${type}`, value);
}

export async function getStats(): Promise<{ analyses: number; savings: number }> {
  const [analyses, savings] = await Promise.all([
    kv.get("stats:analyses"),
    kv.get("stats:savings"),
  ]);
  return {
    analyses: (analyses as number) || 0,
    savings: (savings as number) || 0,
  };
}
*/
