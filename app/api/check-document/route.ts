import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Nettoie et formate le Base64 pour OpenAI
 */
function formatBase64ForOpenAI(imageBase64: string): string {
  // Nettoyer la chaîne : enlever retours à la ligne, espaces, etc.
  let cleaned = imageBase64.trim().replace(/\s+/g, '');
  
  // Si le préfixe data:image/ est déjà présent, le retourner tel quel
  if (cleaned.startsWith('data:image/')) {
    return cleaned;
  }
  
  // Détecter le type MIME
  const base64Data = cleaned.includes(',') ? cleaned.split(',')[1] : cleaned;
  const firstChars = base64Data.substring(0, 20);
  
  let mimeType = 'image/jpeg'; // Par défaut JPEG
  
  if (firstChars.startsWith('iVBORw0KGgo')) {
    mimeType = 'image/png';
  } else if (firstChars.startsWith('/9j/')) {
    mimeType = 'image/jpeg';
  } else if (firstChars.startsWith('UklGR')) {
    mimeType = 'image/webp';
  }
  
  // Formater avec le préfixe data URI
  return `data:${mimeType};base64,${base64Data}`;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length < 100) {
      return NextResponse.json(
        { success: false, error: "Image manquante ou corrompue" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    // Formater le Base64 pour OpenAI
    const formattedImageUrl = formatBase64ForOpenAI(imageBase64);

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
                url: formattedImageUrl, // Format data:image/jpeg;base64,...
                detail: "low",
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

