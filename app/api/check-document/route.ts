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
          role: "system",
          content: "Tu es un expert en administration. Analyse les documents avec une précision maximale.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Tu es un expert en administration. Analyse cette image. Pour être VALID, le document DOIT impérativement contenir : un montant total en euros, une liste d'articles ou de travaux, et ressembler à une facture ou un devis formel. Si c'est une photo d'objet, de paysage, de personne ou un texte incohérent, réponds INVALID. Réponds UNIQUEMENT par VALID ou INVALID.",
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
      temperature: 0, // Force l'IA à être ultra-précise et moins créative
    });

    const result = response.choices[0]?.message?.content?.trim().toUpperCase() || "INVALID";

    // Vérifier que la réponse est EXACTEMENT "VALID" (pas juste qu'elle contient "VALID")
    // Cela évite d'accepter des réponses comme "INVALID" qui contiendraient "VALID"
    const isValid = result === "VALID";

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

