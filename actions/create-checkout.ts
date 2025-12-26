"use server";

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getAnalysis } from "@/lib/kv";
import { getPricingForCategory } from "@/lib/pricing";

export async function createCheckoutSession(
  analysisId: string
): Promise<{ success: boolean; sessionUrl?: string; error?: string }> {
  // Si Stripe n'est pas configuré, on retourne une erreur
  if (!stripe) {
    return {
      success: false,
      error: "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans votre fichier .env",
    };
  }

  try {
    // Récupérer l'analyse pour obtenir la catégorie
    const analysis = await getAnalysis(analysisId);
    
    if (!analysis) {
      return {
        success: false,
        error: "Analyse introuvable",
      };
    }

    // Déterminer le prix en fonction de la catégorie
    const pricing = getPricingForCategory(analysis.category);
    
    console.log(`[Checkout] Création session pour analyse ${analysisId}, catégorie: ${analysis.category || "non définie"}, prix: ${pricing.label}`);

    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true, // Permet l'utilisation de codes promotionnels
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Analyse VigiDevis Premium",
              description: `Analyse détaillée ligne par ligne + arguments de négociation${analysis.category ? ` (${analysis.category})` : ""}`,
              images: [`${origin}/og-image.png`],
            },
            unit_amount: pricing.amount, // Prix dynamique selon la catégorie
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}&id=${analysisId}`,
      cancel_url: `${origin}/rapport/${analysisId}?payment=cancelled`,
      metadata: {
        analysisId,
        category: analysis.category || "unknown",
        price: pricing.amount.toString(),
      },
      customer_creation: "always",
      billing_address_collection: "required",
      locale: "fr",
    });

    console.log(`[Checkout] Session créée: ${session.id}`);
    console.log(`[Checkout] ⚠️ IMPORTANT: Le checkout utilise price_data (produit dynamique). Si un code promo est refusé, vérifiez dans Stripe Dashboard que le code promo n'a PAS de restriction de Product ID ou Price ID.`);

    return {
      success: true,
      sessionUrl: session.url || undefined,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de la session",
    };
  }
}

