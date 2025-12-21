import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/kv";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Analyse introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}




