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

    // Save image to KV store (pending analysis, not paid yet)
    await savePendingAnalysis(id, imageBase64, category);

    return {
      success: true,
      id,
    };
  } catch (error) {
    console.error("Error creating pending analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

