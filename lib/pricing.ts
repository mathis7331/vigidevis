/**
 * Configuration du pricing dynamique par catégorie
 * Les montants sont en centimes (pour Stripe)
 */

export type Category = "Vêtements" | "Accessoires" | "Vintage" | "Mode";

export interface PricingInfo {
  amount: number; // Montant en centimes
  label: string; // Label formaté pour l'UI (ex: "14,90€")
}

/**
 * Mapping des catégories vers les prix
 */
export const PRICING_MAP: Record<Category, PricingInfo> = {
  Vêtements: {
    amount: 199, // 1,99€
    label: "1,99€",
  },
  Accessoires: {
    amount: 199, // 1,99€
    label: "1,99€",
  },
  Vintage: {
    amount: 199, // 1,99€
    label: "1,99€",
  },
  Mode: {
    amount: 199, // 1,99€
    label: "1,99€",
  },
};

/**
 * Prix par défaut si la catégorie n'est pas trouvée
 */
export const DEFAULT_PRICING: PricingInfo = {
  amount: 199, // 1,99€ par défaut
  label: "1,99€",
};

/**
 * Récupère le prix pour une catégorie donnée
 * @param category - Catégorie de l'analyse (peut être undefined ou une string)
 * @returns PricingInfo avec amount (centimes) et label (formaté)
 */
export function getPricingForCategory(category?: string | null): PricingInfo {
  if (!category) {
    return DEFAULT_PRICING;
  }

  // Normaliser la catégorie (première lettre en majuscule)
  const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  // Vérifier si la catégorie existe dans le mapping
  if (normalizedCategory in PRICING_MAP) {
    return PRICING_MAP[normalizedCategory as Category];
  }

  // Si la catégorie n'est pas reconnue, utiliser le prix par défaut
  console.warn(`[Pricing] Catégorie non reconnue: "${category}", utilisation du prix par défaut`);
  return DEFAULT_PRICING;
}

/**
 * Formate un montant en centimes vers un label formaté
 * @param amount - Montant en centimes
 * @returns Label formaté (ex: "14,90€")
 */
export function formatPrice(amount: number): string {
  const euros = amount / 100;
  return `${euros.toFixed(2).replace(".", ",")}€`;
}










