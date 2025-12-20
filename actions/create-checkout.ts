"use server";

import { stripe, ANALYSIS_PRICE } from "@/lib/stripe";
import { headers } from "next/headers";

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
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Analyse VigiDevis Premium",
              description: "Analyse détaillée ligne par ligne + arguments de négociation",
              images: [`${origin}/og-image.png`],
            },
            unit_amount: ANALYSIS_PRICE, // 7.99€
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/rapport/${analysisId}?payment=success`,
      cancel_url: `${origin}/rapport/${analysisId}?payment=cancelled`,
      metadata: {
        analysisId,
      },
      customer_creation: "always",
      billing_address_collection: "required",
      locale: "fr",
    });

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

