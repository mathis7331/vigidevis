"use server";

import OpenAI from "openai";
import { AnalysisResult } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un Expert en Tarification et Lutte Anti-Fraude avec accès aux prix du marché français.

MISSION : Analyse ce devis LIGNE PAR LIGNE et compare chaque prix avec le marché actuel.

IMPORTANT : Tu DOIS retourner UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, sans commentaires.

1. Identifie le type de devis (Garage, Plomberie, Dentiste, Électricité, etc.).
2. Pour CHAQUE ligne du devis (pièce, prestation, main d'œuvre), crée une entrée dans "line_items" avec :
   - item_name : Nom exact de la pièce/prestation
   - quoted_price : Prix affiché sur le devis (format: "XXX€" ou "XXX.XX€")
   - market_price : Prix moyen du marché français (Oscaro, Amazon, Tarif conventionné, etc.)
   - status : "ok" (prix correct, écart <15%), "warning" (écart 15-30%), "danger" (écart >30%)
   - comment : Explication courte (ex: "3x le prix Amazon", "Tarif conventionnel OK", "Main d'œuvre excessive")

3. Analyse globale :
   - trust_score : Note de 0 à 100 (100 = parfait, 0 = arnaque totale)
   - verdict : Résumé en 2 phrases maximum
   - red_flags : Liste des problèmes majeurs détectés
   - fair_price_estimate : Estimation du prix juste total
   - negotiation_tip : Message de négociation COMPLET structuré ainsi :
     • Formule de politesse d'ouverture (Bonjour)
     • Contexte : J'ai bien reçu votre devis...
     • Problème identifié : En comparant avec les prix du marché...
     • Demande de négociation : Je souhaiterais discuter...
     • Formule de politesse de clôture (Cordialement)

STRUCTURE JSON EXACTE À RETOURNER (copie ce format exactement) :
{
  "category": "ex: Mécanique Auto",
  "trust_score": 85,
  "verdict": "Court résumé du problème ou validation (max 2 phrases)",
  "red_flags": ["Problème 1", "Problème 2"],
  "fair_price_estimate": "350€ - 420€",
  "negotiation_tip": "Bonjour,\n\nJ'ai bien reçu votre devis pour [service]. Après avoir comparé avec les prix du marché actuel, j'ai remarqué que certains postes semblent au-dessus des tarifs pratiqués (notamment [exemple précis]). Seriez-vous disposé à revoir certains montants pour nous rapprocher des prix moyens du secteur ?\n\nJe reste à votre disposition pour en discuter.\n\nCordialement",
  "line_items": [
    {
      "item_name": "Plaquettes de frein avant",
      "quoted_price": "180€",
      "market_price": "60€",
      "status": "danger",
      "comment": "3x le prix Amazon/Oscaro"
    }
  ]
}

RÈGLES STRICTES :
- NE commence PAS par "Voici l'analyse..." ou tout autre texte
- NE mets PAS de balises \`\`\`json ou \`\`\`
- Retourne UNIQUEMENT le JSON, rien d'autre
- Tous les champs sont OBLIGATOIRES
- line_items doit contenir AU MOINS une ligne
- Sois PRÉCIS dans les prix du marché (utilise tes connaissances des prix réels en France)
- Pour "negotiation_tip" : écris un MESSAGE COMPLET avec bonjour, contexte, problème, négociation et formule de politesse (prêt à être copié/collé ou envoyé par SMS)`;

/**
 * Nettoie la réponse de l'IA pour extraire le JSON pur
 */
function cleanAIResponse(content: string): string {
  let cleaned = content.trim();
  
  // Supprimer les balises markdown
  cleaned = cleaned.replace(/```json\n?/gi, '');
  cleaned = cleaned.replace(/```\n?/g, '');
  
  // Supprimer les textes avant le JSON (si l'IA commence par du texte)
  const jsonStart = cleaned.indexOf('{');
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }
  
  // Supprimer les textes après le JSON
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonEnd > 0 && jsonEnd < cleaned.length - 1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }
  
  return cleaned;
}

/**
 * Valide la structure de la réponse IA
 */
function validateAnalysisResult(data: any): { valid: boolean; error?: string } {
  // Vérification des champs obligatoires
  const requiredFields = [
    'category',
    'trust_score',
    'verdict',
    'red_flags',
    'fair_price_estimate',
    'negotiation_tip',
    'line_items'
  ];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Champ manquant: ${field}` };
    }
  }
  
  // Vérification des types
  if (typeof data.category !== 'string') {
    return { valid: false, error: 'category doit être une string' };
  }
  
  if (typeof data.trust_score !== 'number') {
    return { valid: false, error: 'trust_score doit être un number' };
  }
  
  if (typeof data.verdict !== 'string') {
    return { valid: false, error: 'verdict doit être une string' };
  }
  
  if (!Array.isArray(data.red_flags)) {
    return { valid: false, error: 'red_flags doit être un array' };
  }
  
  if (typeof data.fair_price_estimate !== 'string') {
    return { valid: false, error: 'fair_price_estimate doit être une string' };
  }
  
  if (typeof data.negotiation_tip !== 'string') {
    return { valid: false, error: 'negotiation_tip doit être une string' };
  }
  
  if (!Array.isArray(data.line_items)) {
    return { valid: false, error: 'line_items doit être un array' };
  }
  
  if (data.line_items.length === 0) {
    return { valid: false, error: 'line_items ne peut pas être vide' };
  }
  
  // Vérification de chaque line_item
  for (let i = 0; i < data.line_items.length; i++) {
    const item = data.line_items[i];
    const requiredItemFields = ['item_name', 'quoted_price', 'market_price', 'status', 'comment'];
    
    for (const field of requiredItemFields) {
      if (!(field in item)) {
        return { valid: false, error: `line_items[${i}] manque le champ: ${field}` };
      }
    }
    
    if (!['ok', 'warning', 'danger'].includes(item.status)) {
      return { valid: false, error: `line_items[${i}].status doit être "ok", "warning" ou "danger"` };
    }
  }
  
  return { valid: true };
}

export async function analyzeQuote(
  imageBase64: string,
  category?: string | null
): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
  try {
    // Vérification de la clé API
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "Configuration manquante. Veuillez contacter le support.",
      };
    }

    console.log('🚀 Début de l\'analyse IA...');
    if (category) {
      console.log(`📁 Catégorie sélectionnée: ${category}`);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse ce devis${category ? ` dans la catégorie ${category}` : ''} et retourne UNIQUEMENT le JSON demandé, sans markdown, sans texte explicatif.${category ? ` L'utilisateur a sélectionné "${category}", donc priorise l'analyse pour ce type de devis.` : ''}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3, // Réduit pour plus de cohérence
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ Aucune réponse de l\'IA');
      return {
        success: false,
        error: "L'IA n'a pas pu générer de réponse. Veuillez réessayer.",
      };
    }

    console.log('📥 Réponse brute de l\'IA reçue');
    console.log('Longueur:', content.length, 'caractères');

    // Nettoyage de la réponse
    const cleanedContent = cleanAIResponse(content);
    console.log('🧹 Réponse nettoyée');

    // Tentative de parsing JSON
    let result: AnalysisResult;
    try {
      result = JSON.parse(cleanedContent);
      console.log('✅ JSON parsé avec succès');
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON');
      console.error('Réponse brute de l\'IA:');
      console.error('─'.repeat(80));
      console.error(content);
      console.error('─'.repeat(80));
      console.error('Après nettoyage:');
      console.error('─'.repeat(80));
      console.error(cleanedContent);
      console.error('─'.repeat(80));
      console.error('Erreur:', parseError);
      
      return {
        success: false,
        error: "Désolé, l'IA n'a pas pu lire ce format de devis. Assurez-vous que le document est bien lisible et contient un devis clair.",
      };
    }

    // Validation de la structure
    const validation = validateAnalysisResult(result);
    if (!validation.valid) {
      console.error('❌ Validation échouée:', validation.error);
      console.error('Données reçues:', JSON.stringify(result, null, 2));
      
      return {
        success: false,
        error: `Format de réponse invalide: ${validation.error}. Veuillez réessayer avec un devis plus clair.`,
      };
    }

    // Normalisation du trust_score
    result.trust_score = Math.max(0, Math.min(100, result.trust_score));

    console.log('✅ Analyse terminée avec succès');
    console.log(`📊 Score de confiance: ${result.trust_score}/100`);
    console.log(`📝 ${result.line_items.length} ligne(s) analysée(s)`);

    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error('💥 Erreur critique lors de l\'analyse:');
    console.error(error);

    // Erreur spécifique OpenAI
    if (error instanceof Error && error.message.includes('API key')) {
      return {
        success: false,
        error: "Configuration API invalide. Veuillez contacter le support.",
      };
    }

    // Erreur réseau
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return {
        success: false,
        error: "Problème de connexion. Vérifiez votre connexion internet et réessayez.",
      };
    }

    // Erreur générique
    return {
      success: false,
      error: error instanceof Error 
        ? `Erreur technique: ${error.message}` 
        : "Une erreur inattendue est survenue. Veuillez réessayer.",
    };
  }
}
