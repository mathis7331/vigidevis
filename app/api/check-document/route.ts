import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image manquante" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    // Utiliser gpt-4o-mini (très économique) pour la pré-vérification
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse cette image. Réponds uniquement par le mot VALID si c'est un devis de travaux, rénovation ou construction, et INVALID si c'est autre chose (photo, document aléatoire, etc).",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 10, // Très court, juste VALID ou INVALID
      temperature: 0, // Déterministe
    });

    const result = response.choices[0]?.message?.content?.trim().toUpperCase() || "INVALID";

    // Vérifier si la réponse contient VALID
    const isValid = result.includes("VALID");

    console.log(`[Check Document] Result: ${result}, Valid: ${isValid}`);

    return NextResponse.json({
      success: true,
      valid: isValid,
      result: result,
    });
  } catch (error) {
    console.error("[Check Document] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la vérification",
        valid: false, // En cas d'erreur, considérer comme invalide pour sécurité
      },
      { status: 500 }
    );
  }
}

