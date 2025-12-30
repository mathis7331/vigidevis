"use server";

import { nanoid } from "nanoid";
import { savePendingAnalysis } from "@/lib/kv";

/**
 * Crée une analyse en attente (sans analyse OpenAI)
 * L'analyse réelle sera faite après le paiement
 */
export async function createPendingAnalysis(
  imageBase64: string,
  category?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Generate unique ID (8 characters, URL-safe)
    const id = nanoid(8);
    console.log(`[createPendingAnalysis] Creating analysis ${id} with category: ${category || "none"}`);

    // Save image to KV store (pending analysis, not paid yet)
    await savePendingAnalysis(id, imageBase64, category);
    
    // Vérifier que l'analyse a bien été sauvegardée
    const verification = await import("@/lib/kv").then(m => m.getAnalysis(id));
    if (!verification) {
      console.error(`[createPendingAnalysis] Failed to verify saved analysis ${id}`);
      return {
        success: false,
        error: "Échec de la sauvegarde",
      };
    }
    
    console.log(`[createPendingAnalysis] Successfully created and verified analysis ${id}`);
    return {
      success: true,
      id,
    };
  } catch (error) {
    console.error("[createPendingAnalysis] Error creating pending analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

