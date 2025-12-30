"use server";

import { nanoid } from "nanoid";
import { saveAnalysis, incrementStats } from "@/lib/kv";
import { AnalysisResult } from "@/lib/types";

export async function createAnalysis(
  result: AnalysisResult,
  category?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Generate unique ID (8 characters, URL-safe)
    const id = nanoid(8);

    // Save to KV store (unpaid by default)
    await saveAnalysis(id, result, false, category);

    // Increment analysis counter
    await incrementStats("analyses");

    return {
      success: true,
      id,
    };
  } catch (error) {
    console.error("Error creating analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}















