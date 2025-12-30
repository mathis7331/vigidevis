import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/kv";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    console.log(`[API] Fetching analysis ${id}`);
    const analysis = await getAnalysis(id);

    if (!analysis) {
      console.error(`[API] Analysis ${id} not found`);
      return NextResponse.json(
        { success: false, error: "Analyse introuvable" },
        { status: 404 }
      );
    }

    console.log(`[API] Analysis ${id} found, isPaid: ${analysis.isPaid}, hasResult: ${!!analysis.result}`);
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(`[API] Error fetching analysis ${id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}




