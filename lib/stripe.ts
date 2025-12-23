import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

// Server-side Stripe instance
// Si la clé n'est pas configurée, on retourne null (pour le développement sans Stripe)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};

// ⚠️ DEPRECATED: Les prix sont maintenant gérés dynamiquement via lib/pricing.ts
// Ces constantes sont conservées pour compatibilité mais ne doivent plus être utilisées
// Utilisez getPricingForCategory() depuis lib/pricing.ts à la place
/** @deprecated Utilisez getPricingForCategory() depuis lib/pricing.ts */
export const ANALYSIS_PRICE = 1490; // Prix par défaut (14.90€) en centimes
/** @deprecated Utilisez getPricingForCategory() depuis lib/pricing.ts */
export const ANALYSIS_PRICE_DISPLAY = "14,90€";

