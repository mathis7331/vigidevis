import { NextRequest, NextResponse } from "next/server";
import { getAnalysis, saveAnalysis, saveAnalysisError } from "@/lib/kv";
import { analyzeQuote } from "@/actions/analyze";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    console.log(`[RETRY API] Retry analysis requested for ${id}`);
    
    // Récupérer l'analyse
    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Analyse introuvable" },
        { status: 404 }
      );
    }

    if (!analysis.isPaid) {
      return NextResponse.json(
        { success: false, error: "L'analyse n'a pas été payée" },
        { status: 403 }
      );
    }

    if (!analysis.imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image manquante, impossible de réessayer" },
        { status: 400 }
      );
    }

    // Si l'analyse a déjà un résultat, ne pas réessayer
    if (analysis.result && !analysis.error) {
      return NextResponse.json(
        { success: false, error: "L'analyse est déjà complète" },
        { status: 400 }
      );
    }

    // Lancer l'analyse
    console.log(`[RETRY API] Starting analysis for ${id}...`);
    const analysisResult = await analyzeQuote(
      analysis.imageBase64,
      analysis.category || null
    );

    if (!analysisResult.success || !analysisResult.data) {
      console.error(`[RETRY API] Analysis failed for ${id}: ${analysisResult.error}`);
      await saveAnalysisError(
        id,
        "IA_FAILED",
        analysisResult.error || "Analysis failed on retry",
        true
      );
      return NextResponse.json(
        { success: false, error: analysisResult.error || "Échec de l'analyse" },
        { status: 500 }
      );
    }

    // Sauvegarder le résultat
    await saveAnalysis(id, analysisResult.data, true, analysis.category);
    console.log(`[RETRY API] ✅ Analysis ${id} retried and saved successfully`);

    return NextResponse.json({
      success: true,
      message: "Analyse relancée avec succès",
    });

  } catch (error) {
    console.error(`[RETRY API] Error retrying analysis ${id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la relance" },
      { status: 500 }
    );
  }
}










